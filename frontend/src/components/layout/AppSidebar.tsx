import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Building2,
  Settings,
  Kanban,
  ListTodo,
  UserCircle,
  BarChart3,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { CheckCircle } from "lucide-react";

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Task Board", url: "/admin/board", icon: Kanban },
  { title: "Tasks List", url: "/admin/tasks", icon: CheckSquare },
  { title: "Members", url: "/admin/members", icon: Users },
  { title: "Organization", url: "/admin/organization", icon: Building2 },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

const userItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Tasks", url: "/dashboard/tasks", icon: ListTodo },
  { title: "Task Board", url: "/dashboard/board", icon: Kanban },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Profile", url: "/dashboard/profile", icon: UserCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const items = isAdmin ? adminItems : userItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-display font-bold">Tasky</span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isAdmin ? "Admin" : "Menu"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin" || item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
