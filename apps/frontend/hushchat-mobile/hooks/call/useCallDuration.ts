import { useEffect, useState } from "react";
import { useCallStore } from "@/store/call/useCallStore";
import { CallState } from "@/types/call/callSignaling";

export function useCallDuration(): string {
  const [seconds, setSeconds] = useState(0);
  const activeCall = useCallStore((s) => s.activeCall);

  const isConnected = activeCall?.callState === CallState.CONNECTED;
  const connectedAt = activeCall?.connectedAt;

  useEffect(() => {
    if (!isConnected || !connectedAt) {
      setSeconds(0);
      return;
    }

    // Calculate initial elapsed time
    setSeconds(Math.floor((Date.now() - connectedAt) / 1000));

    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - connectedAt) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, connectedAt]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
