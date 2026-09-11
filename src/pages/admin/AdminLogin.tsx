import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BrandLogo from "@/components/BrandLogo";

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
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background-sand">
      {/* Left — sign-in */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* The branded panel is hidden on small screens, so show the mark here. */}
          <div className="md:hidden mb-10">
            <BrandLogo className="h-10 w-auto" />
          </div>

          <div className="mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-slate mb-4">
              Administrator
            </p>
            <h1 className="text-3xl text-charcoal">Sign in</h1>
            <div className="mt-6 h-px w-12 bg-charcoal/20" />
          </div>

          <div className="bg-card border border-border-subtle rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs tracking-[0.2em] uppercase text-slate"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg text-charcoal focus:outline-hidden focus:ring-1 focus:ring-charcoal transition"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-xs tracking-[0.2em] uppercase text-slate"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg text-charcoal focus:outline-hidden focus:ring-1 focus:ring-charcoal transition"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              {notice && <p className="text-sm text-slate">{notice}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-8 py-3 text-sm font-medium tracking-wider uppercase bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition disabled:opacity-60"
              >
                {loading ? "Signing In…" : "Sign In"}
              </button>
            </form>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="mt-4 w-full text-center text-sm text-muted-slate underline underline-offset-4 hover:text-charcoal transition"
            >
              Forgot password?
            </button>
          </div>

          <p className="mt-8 text-xs tracking-[0.15em] uppercase text-muted-slate">
            Authorized Personnel Only
          </p>
        </div>
      </div>

      {/* Right — branded panel */}
      <aside className="hidden md:flex flex-col items-center justify-center bg-charcoal px-16 py-24">
        <BrandLogo variant="dark" className="h-16 w-auto" />
        <div className="mt-10 h-px w-12 bg-white/20" />
      </aside>
    </main>
  );
};

export default AdminLogin;
