import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

/** 임시 인증 상태 목업 — 추후 실제 인증으로 교체. */
export const useAuthStore = create<AuthState>()((set) => ({
  isLoggedIn: false,
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),
}));
