import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ALLOWED_HOSTS = [
  "oceancitydevelopment.com",
  "www.oceancitydevelopment.com",
  "localhost",
  "127.0.0.1",
];

const BOT_PATTERN =
  /bot|crawl|spider|slurp|bing|yandex|baidu|duckduck|facebookexternalhit|embedly|quora|pinterest|semrush|ahrefs|petal|headless|lighthouse|preview|monitor|curl|wget|python-requests|node-fetch|go-http/i;

/** Only accept pings coming from our own site (or a Lovable preview). */
function originAllowed(req: Request): boolean {
  const raw = req.headers.get("origin") ?? req.headers.get("referer");
  if (!raw) return false;
  let host: string;
  try {
    host = new URL(raw).hostname.toLowerCase();
  } catch {
    return false;
  }
  if (ALLOWED_HOSTS.includes(host)) return true;
  return host.endsWith(".lovable.app") || host.endsWith(".lovableproject.com");
}

function deviceFrom(ua: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

function isDevelopmentHost(host: string | null): boolean {
  if (!host) return false;
  const h = host.toLowerCase();
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "lovable.dev" ||
    h.endsWith(".lovable.dev") ||
    h.endsWith(".lovable.app") ||
    h.endsWith(".lovableproject.com")
  );
}

function sourceFrom(host: string | null): string {
  if (!host) return "direct";
  const h = host.toLowerCase();
  if (isDevelopmentHost(h)) return "direct";
  // AI assistants are a distinct acquisition channel and must not fall into "other".
  if (
    h.includes("chatgpt") ||
    h.includes("openai") ||
    h.includes("perplexity") ||
    h.includes("claude") ||
    h.includes("anthropic") ||
    h.includes("copilot") ||
    h.includes("gemini.google")
  )
    return "ai";
  // Partner network: the three related companies link to each other.
  if (h.includes("hallidayarchitects") || h.includes("hallidayleonard")) return "partner";
  if (h.includes("google")) return "google";
  if (h.includes("bing") || h.includes("duckduckgo") || h.includes("yahoo")) return "search";
  if (h.includes("facebook") || h.includes("fb.")) return "facebook";
  if (h.includes("instagram")) return "instagram";
  if (h.includes("linkedin")) return "linkedin";
  if (h.includes("zillow") || h.includes("realtor") || h.includes("mls") || h.includes("brightmls"))
    return "listings";
  if (h.includes("oceancitydevelopment")) return "direct";
  return "other";
}

async function sha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const str = (v: unknown, max: number): string | null =>
  typeof v === "string" && v ? v.slice(0, max) : null;

const noContent = () => new Response(null, { status: 204, headers: corsHeaders });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return noContent();

  try {
    if (!originAllowed(req)) return noContent();

    const userAgent = req.headers.get("user-agent") ?? "";
    if (!userAgent || BOT_PATTERN.test(userAgent)) return noContent();

    let body: Record<string, unknown> | null = null;
    try {
      const text = await req.text();
      if (text) body = JSON.parse(text);
    } catch {
      /* malformed body -> silent no-op */
    }
    if (!body) return noContent();

    const path = typeof body["path"] === "string" ? body["path"].slice(0, 300) : "";
    if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api"))
      return noContent();

    const sessionId = str(body["session_id"], 64);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Duration ping: update the visit that was already recorded for this session.
    if (body["event"] === "duration") {
      const seconds = Number(body["duration"]);
      if (!sessionId || !Number.isFinite(seconds) || seconds <= 0) return noContent();
      const capped = Math.min(Math.round(seconds), 3600);
      const { data: row } = await supabase
        .from("page_views")
        .select("id")
        .eq("session_id", sessionId)
        .eq("path", path)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (row?.id) {
        await supabase.from("page_views").update({ duration_seconds: capped }).eq("id", row.id);
      }
      return noContent();
    }

    let referrerHost: string | null = null;
    if (typeof body["referrer"] === "string" && body["referrer"]) {
      try {
        referrerHost = new URL(body["referrer"] as string).hostname.toLowerCase().slice(0, 200);
      } catch {
        referrerHost = null;
      }
    }
    // Internal navigation and Lovable development previews are not acquisition sources.
    if (referrerHost && (referrerHost.includes("oceancitydevelopment") || isDevelopmentHost(referrerHost))) {
      referrerHost = null;
    }

    const salt = Deno.env.get("ANALYTICS_SALT") ?? "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("cf-connecting-ip") ??
      "unknown";
    const utcDay = new Date().toISOString().slice(0, 10);
    // One-way, daily-rotating. The raw IP / UA are never persisted.
    const visitorHash = await sha256(`${salt}|${utcDay}|${ip}|${userAgent}`);

    const rawUtmSource = str(body["utm_source"], 100);
    const utmSource = isDevelopmentHost(rawUtmSource) ? null : rawUtmSource;
    const utmSourceGroup = sourceFrom(utmSource);
    const source = utmSource ? (utmSourceGroup === "other" ? "other" : utmSourceGroup) : sourceFrom(referrerHost);

    const { error } = await supabase.from("page_views").insert({
      path,
      referrer_host: referrerHost,
      source,
      device: deviceFrom(userAgent),
      country: req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry") ?? null,
      visitor_hash: visitorHash,
      session_id: sessionId,
      utm_source: utmSource,
      utm_medium: str(body["utm_medium"], 100),
      utm_campaign: str(body["utm_campaign"], 100),
      day: utcDay,
    });
    if (error) console.error("track-view insert failed:", error.message);
  } catch (err) {
    console.error("track-view error:", err instanceof Error ? err.message : String(err));
  }

  // Always silent — tracking must never affect the public site.
  return noContent();
});
