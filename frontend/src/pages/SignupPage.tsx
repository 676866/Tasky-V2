import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, Mail, ArrowRight, User, Lock, Github, Chrome } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* LEFT PANEL: Branding & Mesh Gradient */}
      <div className="hidden lg:flex flex-[1.1] relative overflow-hidden bg-[#1e061f]">
        {/* Mesh Gradient Background (Light Blue & Pink) */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-400/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-5%] right-[5%] w-[40%] h-[40%] bg-pink-400/10 blur-[120px] rounded-full" />
        </div>

        {/* Curved Wave Divider */}
        <div className="absolute -right-1 top-0 h-full w-32 z-10">
          <svg className="h-full w-full fill-white" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 C 40 0, 100 20, 100 100 L 100 0 Z" />
          </svg>
        </div>

        <div className="relative z-20 flex flex-col justify-between p-16 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white font-display">Tasky.</span>
          </div>

          <div className="max-w-md space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sky-300 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
              ToDo to Done? Drug it with ease.
            </div>

            <h2 className="text-6xl font-bold text-white leading-[1.1] tracking-tight font-display">
              Productivity <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-pink-400 italic">
                without the tears.
              </span>
            </h2>
            
            <p className="text-lg text-white/50 font-medium leading-relaxed">
Sign up to manage your tasks and collaborate with your team in real-time.            </p>
          </div>

          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
            <span>Secure</span>
            <span>Encrypted</span>
            <span>Private</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Two-Step Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-20">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Create account</h1>
            <p className="text-slate-500 mt-2">We’ll send a verification code to your email.</p>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-12 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-slate-100 font-semibold text-slate-600">
                    <Chrome className="mr-2 w-4 h-4 text-slate-400" /> Google
                  </Button>
                  <Button variant="outline" className="h-12 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-slate-100 font-semibold text-slate-600">
                    <Github className="mr-2 w-4 h-4 text-slate-400" /> GitHub
                  </Button>
                </div> */}
{/* 
                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                  <span className="relative bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Or continue with</span>
                </div> */}

                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/30 focus:ring-4 focus:ring-sky-500/5 transition-all text-lg"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-500/20" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Code <ArrowRight className="ml-2 w-5 h-5" /></>}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verification Code</Label>
                    <Input
                      id="otp"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-14 text-center text-2xl font-black tracking-[0.5em] rounded-2xl border-indigo-100 bg-indigo-50/30 text-indigo-600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="h-12 pl-12 rounded-xl border-slate-100" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" title="Password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <Input id="password" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pl-12 rounded-xl border-slate-100" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-500/20" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Account"}
                  </Button>
                  <button type="button" onClick={() => setStep("email")} className="text-sm font-semibold text-slate-400 hover:text-slate-600 w-full transition-colors">
                    Use a different email
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-10 text-center text-slate-500 font-medium">
            Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline underline-offset-4">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
