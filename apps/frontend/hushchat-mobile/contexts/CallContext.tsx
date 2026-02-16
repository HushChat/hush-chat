import React, { createContext, useContext, ReactNode } from "react";
import { useCallManager } from "@/hooks/call/useCallManager";
import { CallStatus } from "@/types/call/signalingTypes";

interface CallContextValue {
  status: CallStatus;
  callLogId: number | null;
  conversationId: number | null;
  remoteUserId: number | null;
  remoteUserName: string | null;
  isVideo: boolean;
  isInitiator: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  initiateCall: (conversationId: number, remoteUserName: string, remoteUserId: number) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
}

const CallContext = createContext<CallContextValue | undefined>(undefined);

export function CallProvider({ children }: { children: ReactNode }) {
  const callManager = useCallManager();

  return <CallContext.Provider value={callManager}>{children}</CallContext.Provider>;
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within CallProvider");
  }
  return context;
}
