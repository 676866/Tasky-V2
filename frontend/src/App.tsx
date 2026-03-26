import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotFound from "./pages/NotFound";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBoardPage from "./pages/admin/AdminBoardPage";
import AdminTasksPage from "./pages/admin/AdminTasksPage";
import AdminMembersPage from "./pages/admin/AdminMembersPage";
import AdminOrganizationPage from "./pages/admin/AdminOrganizationPage";
import AdminOrganizationDetailPage from "./pages/admin/AdminOrganizationDetailPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";

import UserDashboard from "./pages/user/UserDashboard";
import UserBoardPage from "./pages/user/UserBoardPage";
import UserTasksPage from "./pages/user/UserTasksPage";
import UserProfilePage from "./pages/user/UserProfilePage";
import UserAnalyticsPage from "./pages/user/UserAnalyticsPage";
import { getAuthClient } from "./lib/auth";
import { api } from "./lib/api";

const queryClient = new QueryClient();

function ThemeInitializer() {
  const theme = useAuthStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return null;
}

function AuthInitializer() {
  const { user, token, login, logout } = useAuthStore();
  useEffect(() => {
    if (user) return;
    if (token) {
      api.getMe().then((u) => login(u, token)).catch(() => logout());
      return;
    }
    getAuthClient().then((client) => {
      if (client?.getSession) {
        client
          .getSession()
          .then((result: { data?: { user?: { email?: string; name?: string } } }) => {
            const u = result?.data?.user;
            if (u?.email && u?.name) api.neonSession(u.email, u.name).then(({ user: synced, token: t }) => login(synced, t)).catch(() => {});
          })
          .catch(() => {});
      }
    });
  }, []);
  return null;
}

const App = () => (
  <>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ThemeInitializer />
          <AuthInitializer />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/board" element={<ProtectedRoute requiredRole="admin"><AdminBoardPage /></ProtectedRoute>} />
            <Route path="/admin/tasks" element={<ProtectedRoute requiredRole="admin"><AdminTasksPage /></ProtectedRoute>} />
            <Route path="/admin/members" element={<ProtectedRoute requiredRole="admin"><AdminMembersPage /></ProtectedRoute>} />
            <Route path="/admin/organization" element={<ProtectedRoute requiredRole="admin"><AdminOrganizationPage /></ProtectedRoute>} />
            <Route path="/admin/organization/:id" element={<ProtectedRoute requiredRole="admin"><AdminOrganizationDetailPage /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalyticsPage /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettingsPage /></ProtectedRoute>} />

            {/* User routes */}
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/board" element={<ProtectedRoute requiredRole="user"><UserBoardPage /></ProtectedRoute>} />
            <Route path="/dashboard/tasks" element={<ProtectedRoute requiredRole="user"><UserTasksPage /></ProtectedRoute>} />
            <Route path="/dashboard/analytics" element={<ProtectedRoute requiredRole="user"><UserAnalyticsPage /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute requiredRole="user"><UserProfilePage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </>
);

export default App;
