/**
 * Maintenance mode.
 *
 * Signed-out visitors always see the holding page — there is no window in
 * which the real site is visible while the auth check is still running, which
 * is why the default state is "hidden". Signed-in staff see the real site with
 * a permanent banner and can switch to the visitor view to check it.
 *
 * /admin/* is never gated: the switch has to stay reachable.
 */
import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

import BrandLogo from "@/components/BrandLogo";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessInfo, useGlobalBranding, useMaintenance } from "@/hooks/useGlobalBranding";

type StaffStatus = "checking" | "staff" | "visitor";

function useStaffStatus(active: boolean): StaffStatus {
  const [status, setStatus] = useState<StaffStatus>("checking");

  useEffect(() => {
    if (!active) return;
    let alive = true;

    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!alive) return;
      if (!session?.user) {
        setStatus("visitor");
        return;
      }
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .in("role", ["developer", "owner", "editor"])
        .maybeSingle();
      if (!alive) return;
      setStatus(roleRow ? "staff" : "visitor");
    };

    void check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void check();
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [active]);

  return active ? status : "visitor";
}

function HoldingPage({ message }: { message: string }) {
  const { siteName } = useGlobalBranding();
  const business = useBusinessInfo();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-20 text-center">
      <BrandLogo className="mb-10 h-8 w-auto" />
      <h1 className="heading-section text-charcoal mb-4">We'll be back shortly</h1>
      <p className="text-body max-w-xl">{message}</p>
      <div className="mt-10 space-y-1 text-sm text-muted-slate">
        <p>{siteName}</p>
        {business.phoneHref && (
          <p>
            <a href={business.phoneHref} className="hover:text-charcoal transition-colors">
              {business.phone}
            </a>
          </p>
        )}
        {business.email && (
          <p>
            <a
              href={`mailto:${business.email}`}
              className="hover:text-charcoal transition-colors"
            >
              {business.email}
            </a>
          </p>
        )}
      </div>
    </main>
  );
}

function StaffBanner({ onPreview }: { onPreview: () => void }) {
  return (
    <div className="sticky top-0 z-[100] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-amber-500 px-4 py-2 text-center text-xs font-medium text-amber-950">
      <span>
        Maintenance mode is on — you can see the site because you are signed in. Visitors see a
        holding page.
      </span>
      <button type="button" className="underline underline-offset-2" onClick={onPreview}>
        View as a visitor
      </button>
      <Link to="/admin/settings" className="underline underline-offset-2">
        Turn it off
      </Link>
    </div>
  );
}

export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const { enabled, message } = useMaintenance();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const active = enabled && !isAdminRoute;
  const status = useStaffStatus(active);
  const [visitorPreview, setVisitorPreview] = useState(false);

  useEffect(() => {
    if (!active) setVisitorPreview(false);
  }, [active]);

  if (!active) return <>{children}</>;
  if (status !== "staff" || visitorPreview) return <HoldingPage message={message} />;

  return (
    <>
      <StaffBanner onPreview={() => setVisitorPreview(true)} />
      {children}
    </>
  );
}
