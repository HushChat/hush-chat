import { StyleSheet, ViewStyle } from "react-native";

const GRID_CONFIG = {
  MAX_WIDTH: 280,
  IMAGE_GAP: 2,
  BORDER_RADIUS: 8,
};

export const staticStyles = StyleSheet.create({
  documentCardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  documentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  documentIconText: {
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 2,
  },
  documentTextContainer: {
    minWidth: 0,
  },
  documentTitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  documentSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  documentDownloadContainer: {
    marginLeft: 8,
  },
});

export const dynamicStyles = {
  documentCard: (isCurrentUser: boolean, bgColor: string, borderColor: string): ViewStyle => ({
    maxWidth: GRID_CONFIG.MAX_WIDTH,
    padding: 12,
    backgroundColor: bgColor,
    borderRadius: GRID_CONFIG.BORDER_RADIUS,
    borderWidth: 1,
    borderColor,
    alignSelf: isCurrentUser ? "flex-end" : "flex-start",
  }),

  documentIconText: (color: string) => ({
    ...staticStyles.documentIconText,
    color,
  }),

  documentTitle: (color: string) => ({
    ...staticStyles.documentTitle,
    color,
  }),

  documentSubtitle: (color: string) => ({
    ...staticStyles.documentSubtitle,
    color,
  }),
};
