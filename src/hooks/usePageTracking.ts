import { useEffect, useRef } from "react";
import { useLocation } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";

const ENDPOINT = `${import.meta.env["VITE_SUPABASE_URL"]}/functions/v1/track-view`;

/** 5 seconds on the page, or any real interaction, counts as a visit. */
const ENGAGEMENT_MS = 5000;
const SESSION_KEY = "ocdg_session_id";
const UTM_KEY = "ocdg_utm";

type Utm = { utm_source?: string; utm_medium?: string; utm_campaign?: string };

function sessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Campaign tags are captured on the first page of the visit and reused after. */
function utmTags(): Utm {
  try {
    const params = new URLSearchParams(window.location.search);
    const fresh: Utm = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign"] as const) {
      const value = params.get(key);
      if (value) fresh[key] = value.slice(0, 100);
    }
    if (Object.keys(fresh).length) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const stored = sessionStorage.getItem(UTM_KEY);
    return stored ? (JSON.parse(stored) as Utm) : {};
  } catch {
    return {};
  }
}

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  // text/plain avoids a CORS preflight, so sendBeacon can actually
  // transmit the body instead of silently dropping after OPTIONS.
  try {
    const blob = new Blob([body], { type: "text/plain" });
    if (navigator.sendBeacon?.(ENDPOINT, blob)) return;
  } catch {
    /* fall through to fetch */
  }
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body,
    keepalive: true,
  }).catch(() => {
    /* analytics must never break the page */
  });
}

/**
 * Fire-and-forget first-party pageview ping. No cookies, no cross-site identity.
 * A visit only counts after real engagement; signed-in staff are never counted.
 */
export function usePageTracking() {
  const { pathname } = useLocation();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    if (lastSent.current === pathname) return;

    let cancelled = false;
    let recorded = false;
    const startedAt = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const events = ["scroll", "click", "keydown", "touchstart"] as const;

    const record = () => {
      if (recorded || cancelled) return;
      recorded = true;
      lastSent.current = pathname;
      cleanupTriggers();
      send({
        path: pathname,
        referrer: document.referrer,
        session_id: sessionId(),
        ...utmTags(),
      });
    };

    const cleanupTriggers = () => {
      if (timer) clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, record));
    };

    let durationSent = false;
    const sendDuration = () => {
      if (!recorded || durationSent) return;
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      if (seconds <= 0) return;
      durationSent = true;
      send({ event: "duration", path: pathname, session_id: sessionId(), duration: seconds });
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") sendDuration();
    };


    // Signed-in staff browsing their own site must not inflate the numbers.
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled || data.session) return;
      timer = setTimeout(record, ENGAGEMENT_MS);
      events.forEach((e) => window.addEventListener(e, record, { passive: true, once: true }));
    });

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      cleanupTriggers();
      sendDuration();
      document.removeEventListener("visibilitychange", onVisibility);

    };
  }, [pathname]);
}
