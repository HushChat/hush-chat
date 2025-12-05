import { StyleSheet } from "react-native";
import { PROFILE_COLORS, PROFILE_SIZES } from "@/components/profile/profile.constants";

export const profileStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: PROFILE_SIZES.SCROLL_CONTENT_PADDING_BOTTOM,
  },
  centeredContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Avatar
  avatarContainer: {
    position: "relative",
  },
  avatarImage: {
    width: PROFILE_SIZES.AVATAR.WIDTH,
    height: PROFILE_SIZES.AVATAR.HEIGHT,
    borderRadius: PROFILE_SIZES.AVATAR.BORDER_RADIUS,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: PROFILE_COLORS.CAMERA_BG,
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: PROFILE_COLORS.WHITE,
  },

  // Desktop layout
  desktopScrollContainer: {
    flex: 1,
  },
  desktopContentContainer: {
    flexGrow: 1,
    minWidth: PROFILE_SIZES.MIN_DESKTOP_WIDTH,
  },
});

// Input styles that need platform-specific handling
export const getInputPlatformStyles = (isWeb: boolean) => ({
  backgroundColor: "transparent",
  ...(isWeb ? { outlineWidth: 0 } : {}),
});
