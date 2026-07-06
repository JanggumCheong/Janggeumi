import { create } from "zustand";

interface ExampleState {
  count: number;
  increase: () => void;
  reset: () => void;
}

export const useExampleStore = create<ExampleState>()((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));
