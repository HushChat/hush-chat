import { useWindowDimensions } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";

export function useIsMobileLayout() {
  const { width } = useWindowDimensions();
  const MOBILE_BREAKPOINT = 768;

  if (PLATFORM.IS_NATIVE_MOBILE) return true;

  const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent;

  const isMobileUA = /Android|webOS|iPhone|iPad/i.test(userAgent);

  return width <= MOBILE_BREAKPOINT && isMobileUA;
}
