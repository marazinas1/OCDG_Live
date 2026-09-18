import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already signed in as an admin, skip the form.
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active || !session) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .in("role", ["developer", "owner"])
        .maybeSingle();
      if (active && roles) navigate("/admin", { replace: true });
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleForgotPassword = async () => {
    setError(null);
    setNotice(null);

    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/set-password`,
    });
    setNotice("If that address has an account, a reset link is on its way.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError || !data.session) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // Verify admin role. Non-admins get filtered out by RLS.
    const { data: roleRow, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.session.user.id)
      .in("role", ["developer", "owner"])
      .maybeSingle();

    if (roleError || !roleRow) {
      await supabase.auth.signOut();
      setError("This account is not authorized.");
      setLoading(false);
      return;
    }

    navigate("/admin", { replace: true });
  };

  return (
    <main className="grid min-h-screen grid-cols-1 bg-background md:grid-cols-2">
      {/* Left — sign-in */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* The branded panel is hidden on small screens, so show the mark here. */}
          <div className="md:hidden mb-10">
            <BrandLogo className="h-8 w-auto" />
          </div>

          <div className="mb-10">
            <p className="mb-4 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Administrator
            </p>
            <h1 className="text-3xl font-semibold text-foreground">Sign in</h1>
            <div className="mt-6 h-px w-12 bg-border" />
          </div>

          <div className="rounded-lg border border-border bg-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              {notice && <p className="text-sm text-muted-foreground">{notice}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Signing In…" : "Sign In"}
              </Button>
            </form>

            <Button
              type="button"
              variant="link"
              onClick={handleForgotPassword}
              className="mt-4 w-full text-muted-foreground"
            >
              Forgot password?
            </Button>
          </div>

          <p className="mt-8 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Authorized Personnel Only
          </p>
        </div>
      </div>

      {/* Right — branded panel */}
      <aside className="hidden flex-col items-center justify-center bg-primary px-16 py-24 md:flex">
        <BrandLogo variant="dark" className="h-8 w-auto" />
        <div className="mt-10 h-px w-12 bg-card/20" />
      </aside>
    </main>
  );
};

export default AdminLogin;
