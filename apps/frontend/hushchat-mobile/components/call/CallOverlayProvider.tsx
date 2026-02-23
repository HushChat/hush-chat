import React, { ReactNode } from "react";
import { useCallStore } from "@/store/call/useCallStore";
import { useCallManager } from "@/hooks/call/useCallManager";
import { CallState } from "@/types/call/callSignaling";
import IncomingCallOverlay from "@/components/call/IncomingCallOverlay";
import OutgoingCallOverlay from "@/components/call/OutgoingCallOverlay";
import ActiveCallView from "@/components/call/ActiveCallView";

export const CallManagerContext = React.createContext<ReturnType<typeof useCallManager> | null>(
  null
);

export function useCallActions() {
  const context = React.useContext(CallManagerContext);
  if (!context) {
    throw new Error("useCallActions must be used within CallOverlayProvider");
  }
  return context;
}

interface CallOverlayProviderProps {
  children: ReactNode;
}

const CallOverlayProvider = ({ children }: CallOverlayProviderProps) => {
  const callManager = useCallManager();
  const activeCall = useCallStore((s) => s.activeCall);
  const callState = activeCall?.callState;

  return (
    <CallManagerContext.Provider value={callManager}>
      {children}
      {callState === CallState.INCOMING_RINGING && (
        <IncomingCallOverlay onAccept={callManager.acceptCall} onReject={callManager.rejectCall} />
      )}
      {callState === CallState.OUTGOING_RINGING && (
        <OutgoingCallOverlay onCancel={callManager.cancelCall} />
      )}
      {(callState === CallState.CONNECTING || callState === CallState.CONNECTED) && (
        <ActiveCallView
          onEndCall={callManager.endCall}
          onToggleAudio={callManager.toggleAudio}
          onToggleVideo={callManager.toggleVideo}
        />
      )}
    </CallManagerContext.Provider>
  );
};

export default CallOverlayProvider;
