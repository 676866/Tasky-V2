import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminState {
  selectedOrgId: string | null;
  setSelectedOrgId: (id: string | null) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      selectedOrgId: null,
      setSelectedOrgId: (id) => set({ selectedOrgId: id }),
    }),
    { name: "tasky-admin" }
  )
);
