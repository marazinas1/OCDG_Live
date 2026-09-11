import { useEffect, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Landing page for invite / recovery links. An invited user has no admin role
 * yet, so this page must never sit behind AdminProtected.
 */
export default function AdminSetPassword() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session) {
        setHasSession(true);
        setChecking(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setHasSession(Boolean(data.session));
      setChecking(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("The passwords do not match.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password set. Welcome aboard.");
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-8">
        <h1 className="text-xl font-semibold text-slate-900">Set your password</h1>

        {checking ? (
          <p className="text-sm text-slate-500 mt-4">Checking your invite link…</p>
        ) : !hasSession ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-slate-600">
              This link is invalid or has expired. Ask an owner to send you a new
              invitation.
            </p>
            <Link to="/admin/login">
              <Button variant="outline" className="w-full">
                Go to sign in
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving…" : "Save password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
