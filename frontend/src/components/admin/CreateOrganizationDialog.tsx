import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building2, Users, Briefcase } from "lucide-react";

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

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, description: string, groupSize?: string, sector?: string) => Promise<void>;
}

export function CreateOrganizationDialog({ open, onOpenChange, onSubmit }: CreateOrganizationDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupSize, setGroupSize] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit(name, description, groupSize || undefined, sector || undefined);
      setName("");
      setDescription("");
      setGroupSize("");
      setSector("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Create Organization
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Organization Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" required />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your organization do?" rows={3} />
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
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
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
          <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0" disabled={loading || !name.trim()}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Organization
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
