import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, User, ArrowRight, ArrowLeft, CheckCircle, Loader2, Users, Briefcase } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { UserRole } from "@/types";

const GROUP_SIZES = [
  { value: "1-2", label: "1–2 people" },
  { value: "3-10", label: "3–10 people" },
  { value: "10-20", label: "10–20 people" },
  { value: "20+", label: "20+ people" },
];

const ORGANIZATION_SECTORS = [
  "Technology", "Health & Medical", "Transport & Logistics", "Education", "Finance & Banking",
  "Retail", "Manufacturing", "Hospitality", "Construction", "Government", "Non-profit",
  "Legal", "Media & Entertainment", "Agriculture", "Energy", "Real Estate", "Consulting",
  "Food & Beverage", "Automotive", "Telecommunications", "Insurance", "Other",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<UserRole | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgDesc, setOrgDesc] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [sector, setSector] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, updateUser, setOnboardingCompleted, _hasHydrated } = useAuthStore();
  const navigate = useNavigate();

  if (_hasHydrated && !user) {
    return <Navigate to="/login" replace />;
  }
  if (_hasHydrated && user && user.onboardingCompleted) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  const handleFinish = async () => {
    if (!user || !role) return;
    setLoading(true);
    try {
      if (role === "admin") {
        const org = await api.createOrganization(orgName, orgDesc, user.id, groupSize || undefined, sector || undefined);
        updateUser({ role: "admin", organizationId: org.id });
        toast.success(`Organization "${org.name}" created!`);
      } else {
        if (inviteCode) {
          const org = await api.joinOrganization(inviteCode, user.id);
          if (org) {
            updateUser({ role: "user", organizationId: org.id });
            toast.success(`Joined "${org.name}"!`);
          } else {
            toast.error("Invalid invite code. You can join later.");
            updateUser({ role: "user" });
          }
        } else {
          updateUser({ role: "user" });
        }
      }
      await api.completeOnboarding();
      setOnboardingCompleted(true);
      updateUser({ onboardingCompleted: true });
      navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const roleStep = (
    <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold">How will you use Tasky?</h2>
        <p className="text-muted-foreground text-sm mt-1">This helps us personalize your experience.</p>
      </div>
      <div className="grid gap-4">
        <button
          type="button"
          onClick={() => { setRole("admin"); setStep(1); }}
          className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all hover-lift ${role === "admin" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
        >
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-0.5">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold">I'm creating an organization</p>
            <p className="text-sm text-muted-foreground mt-1">Set up your team workspace, invite members, and manage tasks as an admin.</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => { setRole("user"); setStep(1); }}
          className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all hover-lift ${role === "user" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
        >
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
            <User className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <p className="font-semibold">I'm joining a team or using personally</p>
            <p className="text-sm text-muted-foreground mt-1">Manage your own tasks or join an existing organization with an invite code.</p>
          </div>
        </button>
      </div>
    </motion.div>
  );

  const detailsStep = (
    <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      {role === "admin" ? (
        <>
          <div>
            <h2 className="text-2xl font-display font-bold">Create your organization</h2>
            <p className="text-muted-foreground text-sm mt-1">You'll be the admin. You can invite members after setup.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization name</Label>
              <Input id="orgName" placeholder="Acme Corp" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgDesc">Description (optional)</Label>
              <Input id="orgDesc" placeholder="What does your org do?" value={orgDesc} onChange={(e) => setOrgDesc(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Group size
              </Label>
              <Select value={groupSize || "none"} onValueChange={(v) => setGroupSize(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No preference</SelectItem>
                  {GROUP_SIZES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Sector / Type
              </Label>
              <Select value={sector || "none"} onValueChange={(v) => setSector(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sector (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No preference</SelectItem>
                  {ORGANIZATION_SECTORS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <h2 className="text-2xl font-display font-bold">Join an organization</h2>
            <p className="text-muted-foreground text-sm mt-1">Enter an invite code, or skip to use Tasky for personal tasks.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite">Invite code</Label>
            <Input id="invite" placeholder="e.g. ACME-2025" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
          </div>
        </>
      )}
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => setStep(0)}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          type="button"
          className="flex-1 gradient-primary text-primary-foreground border-0"
          onClick={handleFinish}
          disabled={loading || (role === "admin" && !orgName.trim())}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
          {role === "admin" ? "Create & Continue" : inviteCode ? "Join & Continue" : "Skip & Continue"}
        </Button>
      </div>
    </motion.div>
  );

  const steps = [roleStep, detailsStep];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold">Tasky</span>
        </div>
        <div className="flex gap-2 mb-8">
          {[0, 1].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? "gradient-primary" : "bg-muted"}`} />
          ))}
        </div>
        <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
      </div>
    </div>
  );
}
