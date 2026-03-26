import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { getAuthClient } from "@/lib/auth";

export default function LoginPage() {
  const { user, _hasHydrated, onboardingCompleted } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  useEffect(() => {
    if (!_hasHydrated || !user) return;
    if (!onboardingCompleted) {
      navigate("/onboarding", { replace: true });
    } else {
      navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [_hasHydrated, user, onboardingCompleted, navigate]);

  if (_hasHydrated && user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const neonClient = await getAuthClient();
      if (neonClient?.signIn?.email) {
        const result = await neonClient.signIn.email({ email, password });
        const neonUser = result?.data?.user;
        if (!neonUser?.email || !neonUser?.name) {
          toast.error("Invalid credentials");
          return;
        }
        const { user: synced, token } = await api.neonSession(neonUser.email, neonUser.name);
        login(synced, token);
        toast.success(`Welcome back, ${synced.name}!`);
        navigate(synced.onboardingCompleted ? (synced.role === "admin" ? "/admin" : "/dashboard") : "/onboarding");
      } else {
        const { user, token } = await api.login(email, password);
        login(user, token);
        toast.success(`Welcome back, ${user.name}!`);
        navigate(user.onboardingCompleted ? (user.role === "admin" ? "/admin" : "/dashboard") : "/onboarding");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-2xl font-display font-bold">Tasky</span>
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">Welcome back</h2>
          <p className="text-primary-foreground/70">
            Sign in to manage your tasks and collaborate with your team.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">Tasky</span>
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your credentials to continue
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tasky.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Any password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground border-0"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sign in
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
          <div className="text-xs text-muted-foreground text-center p-3 rounded-lg bg-muted/50">
            <strong>Demo:</strong> admin@tasky.io or user@tasky.io (any
            password)
          </div>
        </div>
      </div>
    </div>
  );
}
