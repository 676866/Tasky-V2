import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl gradient-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue={user?.name} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={user?.email} disabled />
              </div>
              <Button className="gradient-primary text-primary-foreground border-0">Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
