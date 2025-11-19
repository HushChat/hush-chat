import { StyleSheet, ImageStyle } from "react-native";

export const GRID_CONFIG = {
  MAX_WIDTH: 280,
  MAX_HEIGHT: 280,
  SINGLE_IMAGE_MAX_HEIGHT: 350,
  IMAGE_GAP: 2,
  BORDER_RADIUS: 8,
  MAX_DISPLAY_IMAGES: 4,
} as const;

export const COLORS = {
  OVERLAY_DARK: "rgba(0,0,0,0.65)",
};

const createImageStyle = (width: number, height: number): ImageStyle => ({
  width,
  height,
  borderRadius: GRID_CONFIG.BORDER_RADIUS,
});

export const staticStyles = StyleSheet.create({
  gap: {
    gap: GRID_CONFIG.IMAGE_GAP,
  },
  flexRow: {
    flexDirection: "row",
  },
  singleImageContainer: {
    overflow: "hidden",
    borderRadius: GRID_CONFIG.BORDER_RADIUS,
  },
  imageItemContainer: {
    position: "relative",
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.OVERLAY_DARK,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: GRID_CONFIG.BORDER_RADIUS,
  },
});

export const dynamicStyles = {
  singleImage: (aspectRatio: number): ImageStyle => {
    const maxWidth = GRID_CONFIG.MAX_WIDTH;
    const maxHeight = GRID_CONFIG.SINGLE_IMAGE_MAX_HEIGHT;

    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return {
      width,
      height,
      borderRadius: GRID_CONFIG.BORDER_RADIUS,
    };
  },

  twoImagesImage: createImageStyle(
    (GRID_CONFIG.MAX_WIDTH - GRID_CONFIG.IMAGE_GAP) / 2,
    GRID_CONFIG.MAX_HEIGHT / 1.5
  ),

  threeImagesLarge: createImageStyle(
    (GRID_CONFIG.MAX_WIDTH - GRID_CONFIG.IMAGE_GAP) / 2,
    GRID_CONFIG.MAX_HEIGHT / 1.3
  ),

  threeImagesSmall: createImageStyle(
    (GRID_CONFIG.MAX_WIDTH - GRID_CONFIG.IMAGE_GAP) / 2,
    (GRID_CONFIG.MAX_HEIGHT / 1.3 - GRID_CONFIG.IMAGE_GAP) / 2
  ),

  fourImagesImage: createImageStyle(
    (GRID_CONFIG.MAX_WIDTH - GRID_CONFIG.IMAGE_GAP) / 2,
    (GRID_CONFIG.MAX_HEIGHT - GRID_CONFIG.IMAGE_GAP) / 2
  ),
};
