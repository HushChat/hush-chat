import { PLATFORM } from "@/constants/platformConstants";

export const getHoverVisibilityClass = () =>
  PLATFORM.IS_WEB ? "opacity-0 group-hover:opacity-100 hover:opacity-100" : "opacity-100";

export const getActionButtonStyle = (pressed: boolean) => ({
  minWidth: 24,
  minHeight: 24,
  opacity: pressed ? 0.7 : 1,
  cursor: "pointer" as const,
});

export const getSelectionIconPosition = (isCurrentUser: boolean) => ({
  position: "absolute" as const,
  top: -6,
  left: isCurrentUser ? undefined : -6,
  right: isCurrentUser ? -6 : undefined,
  zIndex: 10,
});

export const getBubbleBorderStyle = (isForwardedMessage: boolean, isCurrentUser: boolean) => {
  if (!isForwardedMessage) return {};

  return isCurrentUser
    ? { borderRightWidth: 2, borderRightColor: "#60A5FA30" }
    : { borderLeftWidth: 2, borderLeftColor: "#9CA3AF30" };
};
