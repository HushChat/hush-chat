import { useState, useEffect, useRef } from "react";

export function useCallTimer(startedAt: number | null): string {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }

    const tick = () => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startedAt]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
