import React from "react";
import { useCallStore } from "@/store/call/useCallStore";
import { CallStatus } from "@/types/call/signalingTypes";
import IncomingCallOverlay from "@/components/call/IncomingCallOverlay";
import OutgoingCallScreen from "@/components/call/OutgoingCallScreen";
import ActiveCallScreen from "@/components/call/ActiveCallScreen";

export default function CallOverlayContainer() {
  const status = useCallStore((state) => state.status);

  switch (status) {
    case CallStatus.INCOMING_RINGING:
      return <IncomingCallOverlay />;
    case CallStatus.OUTGOING_RINGING:
      return <OutgoingCallScreen />;
    case CallStatus.CONNECTING:
    case CallStatus.CONNECTED:
      return <ActiveCallScreen />;
    default:
      return null;
  }
}
