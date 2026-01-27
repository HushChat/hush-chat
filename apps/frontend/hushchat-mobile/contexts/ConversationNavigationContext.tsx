import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ConversationNavigationContextType {
  messageToJump: number | null;
  jumpToMessage: (messageId: number) => void;
  clearMessageToJump: () => void;
}

const ConversationNavigationContext = createContext<ConversationNavigationContextType | null>(null);

export function ConversationNavigationProvider({ children }: { children: ReactNode }) {
  const [messageToJump, setMessageToJump] = useState<number | null>(null);

  const jumpToMessage = useCallback((messageId: number) => {
    setMessageToJump(messageId);
  }, []);

  const clearMessageToJump = useCallback(() => {
    setMessageToJump(null);
  }, []);

  return (
    <ConversationNavigationContext.Provider
      value={{ messageToJump, jumpToMessage, clearMessageToJump }}
    >
      {children}
    </ConversationNavigationContext.Provider>
  );
}

export function useConversationNavigation() {
  const context = useContext(ConversationNavigationContext);
  if (!context) {
    throw new Error("useConversationNavigation must be used within ConversationNavigationProvider");
  }
  return context;
}
