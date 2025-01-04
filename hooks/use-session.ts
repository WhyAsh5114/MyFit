import { Session, User } from "better-auth";
import { create } from "zustand";

type SessionState = {
  value?: { session: Session; user: User } | null | undefined;
  setSession: (value: { session: Session; user: User }) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  value: undefined,
  setSession: (value) => set({ value }),
  clearSession: () => set({ value: null }),
}));
