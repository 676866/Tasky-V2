import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Copy, Plus, Users, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Organization } from "@/types";
import { toast } from "sonner";
import { CreateOrganizationDialog } from "@/components/admin/CreateOrganizationDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export default function AdminOrganizationPage() {
  const { user, updateUser } = useAuthStore();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const orgs = await api.getOrganizations();
    const adminOrgs = orgs.filter((o) => o.ownerId === user.id);
    setOrganizations(adminOrgs);
    setLoading(false);
  };

  const handleCreate = async (name: string, description: string, groupSize?: string, sector?: string) => {
    if (!user) return;
    const org = await api.createOrganization(name, description, user.id, groupSize, sector);
    updateUser({ organizationId: org.id, role: "admin" });
    toast.success(`"${org.name}" created!`);
    await loadData();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Organizations</h1>
          <Button className="gradient-primary text-primary-foreground border-0" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Organization
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}
          </div>
        ) : organizations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display font-semibold text-lg mb-2">No organizations yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first organization to get started</p>
              <Button className="gradient-primary text-primary-foreground border-0" onClick={() => setCreateOpen(true)}>
                Create Organization
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <Card
                key={org.id}
                className="group cursor-pointer hover:shadow-md transition-all hover-lift"
                onClick={() => navigate(`/admin/organization/${org.id}`)}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold truncate">{org.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{org.description || "No description"}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                    <div className="text-center">
                      <Users className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-sm font-bold">{org.memberIds.length}</p>
                      <p className="text-[10px] text-muted-foreground">Members</p>
                    </div>
                    {org.sector && (
                      <div className="text-center">
                        <Building2 className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xs font-medium truncate">{org.sector}</p>
                        <p className="text-[10px] text-muted-foreground">Sector</p>
                      </div>
                    )}
                    <div className="text-center">
                      <Calendar className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xs font-medium">{new Date(org.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
                      <p className="text-[10px] text-muted-foreground">Created</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      <code className="text-xs font-mono text-primary">{org.inviteCode}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(org.inviteCode); toast.success("Copied!"); }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    {org.groupSize && <Badge variant="secondary" className="text-[10px]">{org.groupSize}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CreateOrganizationDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} />
      </div>
    </DashboardLayout>
  );
}
