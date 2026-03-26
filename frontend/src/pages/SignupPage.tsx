import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, Mail } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export default function SignupPage() {
  const { user, _hasHydrated, login } = useAuthStore();
  const [step, setStep] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!_hasHydrated || !user) return;
    if (user.onboardingCompleted) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } else {
      navigate("/onboarding", { replace: true });
    }
  }, [_hasHydrated, user, navigate]);

  if (_hasHydrated && user) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.sendOtp(email);
      toast.success("Verification code sent to your email");
      setStep("verify");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user: newUser, token } = await api.signup(name, email, password, otp);
      login(newUser, token);
      toast.success("Account created! Complete your setup.");
      navigate("/onboarding", { replace: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
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
          <h2 className="text-3xl font-display font-bold mb-4">Join thousands of teams</h2>
          <p className="text-primary-foreground/70">Create your account and start managing tasks like a pro.</p>
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
            <h1 className="text-2xl font-display font-bold">Create account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === "email" ? "We’ll send a verification code to your email." : "Enter the code and your details."}
            </p>
          </div>

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Send verification code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="font-mono text-center text-lg tracking-widest"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0" disabled={loading || otp.length !== 6}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create account
              </Button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-sm text-muted-foreground hover:text-foreground w-full"
              >
                Use a different email
              </button>
            </form>
          )}

          <p className="text-sm text-center text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
