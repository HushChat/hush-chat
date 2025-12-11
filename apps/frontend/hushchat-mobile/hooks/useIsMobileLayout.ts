import { PLATFORM } from "@/constants/platformConstants";
import { useWindowDimensions } from "react-native";

export function useIsMobileLayout() {
  const { width } = useWindowDimensions();
  const MOBILE_BREAKPOINT = 768;

  if (PLATFORM.IS_NATIVE_MOBILE) return true;
  return width <= MOBILE_BREAKPOINT;
}
