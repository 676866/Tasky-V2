import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useAdminStore } from "@/store/admin-store";
import { api } from "@/lib/api";
import { Organization } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

export function AdminOrgSelector() {
  const { user } = useAuthStore();
  const { selectedOrgId, setSelectedOrgId } = useAdminStore();
  const [orgs, setOrgs] = useState<Organization[]>([]);

  useEffect(() => {
    if (!user) return;
    api.getOrganizations().then((list) => {
      setOrgs(list);
      if (!selectedOrgId && list.length > 0) {
        setSelectedOrgId(user.organizationId || list[0].id);
      }
    });
  }, [user]);

  const value = selectedOrgId || user?.organizationId || "";
  if (orgs.length <= 1) return null;

  return (
    <Select value={value} onValueChange={(id) => setSelectedOrgId(id || null)}>
      <SelectTrigger className="w-[200px]">
        <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
        <SelectValue placeholder="Organization" />
      </SelectTrigger>
      <SelectContent>
        {orgs.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
