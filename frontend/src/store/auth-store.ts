import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { useAdminStore } from "@/store/admin-store";
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** Set to true only after user completes onboarding; nobody skips it. */
  onboardingCompleted: boolean;
  theme: "light" | "dark";
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setOnboardingCompleted: (v: boolean) => void;
  login: (user: User, token?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  toggleTheme: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      onboardingCompleted: false,
      theme: "light",
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setOnboardingCompleted: (v) => set({ onboardingCompleted: v }),
      login: (user, token) => set({
        user,
        token: token ?? get().token,
        isAuthenticated: true,
        onboardingCompleted: user.onboardingCompleted ?? false,
      }),
      logout: () =>{ set({ user: null, token: null, isAuthenticated: false, onboardingCompleted: false })
     useAdminStore.getState().setSelectedOrgId(null);
    },
       
      updateUser: (updates) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...updates } });
      },
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        document.documentElement.classList.toggle("dark", next === "dark");
        set({ theme: next });
      },
    }),
    {
      name: "tasky-auth",
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated, onboardingCompleted: s.onboardingCompleted, theme: s.theme }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);
