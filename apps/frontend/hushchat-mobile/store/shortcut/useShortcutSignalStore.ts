import { create } from "zustand";

export type ShortcutSignal = "focusSearch" | "newConversation" | "toggleMentionedMessages" | null;

interface ShortcutSignalState {
  pendingSignal: ShortcutSignal;
  setPendingSignal: (signal: ShortcutSignal) => void;
  consumeSignal: () => ShortcutSignal;
}

export const useShortcutSignalStore = create<ShortcutSignalState>((set, get) => ({
  pendingSignal: null,
  setPendingSignal: (signal) => set({ pendingSignal: signal }),
  consumeSignal: () => {
    const signal = get().pendingSignal;
    set({ pendingSignal: null });
    return signal;
  },
}));
