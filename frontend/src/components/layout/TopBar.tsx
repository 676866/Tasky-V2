import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Moon, Sun, LogOut, UserCircle, Bell, CheckCheck } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";
import { formatDistanceToNow } from "date-fns";

export function TopBar() {
  const { user, logout, theme, toggleTheme } = useAuthStore();
  const { notifications, fetchNotifications, markRead, markAllRead, unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchNotifications(user.id);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const unread = unreadCount();

  const typeColors: Record<string, string> = {
    reminder: "bg-warning/10 text-warning",
    assignment: "bg-info/10 text-info",
    update: "bg-success/10 text-success",
    info: "bg-muted text-muted-foreground",
  };

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full gradient-primary text-[10px] text-primary-foreground flex items-center justify-center font-bold">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h4 className="font-display font-semibold text-sm">Notifications</h4>
              {unread > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => user && markAllRead(user.id)}>
                  <CheckCheck className="w-3 h-3 mr-1" /> Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No notifications</div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                      onClick={() => {
                        markRead(n.id);
                        if (n.taskId && user) {
                          const base = user.role === "admin" ? "/admin/board" : "/dashboard/board";
                          navigate(base, { state: { openTaskId: n.taskId } });
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`shrink-0 mt-1 w-2 h-2 rounded-full ${!n.read ? "gradient-primary" : "bg-transparent"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{n.title}</span>
                            <Badge variant="secondary" className={`text-[9px] px-1 py-0 ${typeColors[n.type]}`}>{n.type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs gradient-primary text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(user?.role === "admin" ? "/admin/settings" : "/dashboard/profile")}>
              <UserCircle className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
