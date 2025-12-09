import { PLATFORM } from "@/constants/platformConstants";
import { TextStyle, ViewStyle, ImageStyle } from "react-native";

type BaseSpecs = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  color: string;
};

type MarkdownStyle = {
  [key: string]: TextStyle | ViewStyle | ImageStyle;
};

export const createMarkdownStyles = (baseSpecs: BaseSpecs, textColor: string): MarkdownStyle => {
  return {
    body: {
      padding: 0,
      margin: 0,
      color: baseSpecs.color,
      fontFamily: baseSpecs.fontFamily,
      fontSize: baseSpecs.fontSize,
      lineHeight: baseSpecs.lineHeight,
    },

    paragraph: {
      marginTop: 0,
      marginBottom: 8,
      flexWrap: "wrap",
      flexDirection: "row",
      alignItems: "flex-start",
      color: baseSpecs.color,
    },

    heading1: {
      ...baseSpecs,
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 8,
      marginTop: 4,
    },

    heading2: {
      ...baseSpecs,
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 8,
      marginTop: 4,
    },

    list_item: { marginVertical: 2 },
    bullet_list: { marginBottom: 8 },
    ordered_list: { marginBottom: 8 },
    bullet_list_icon: {
      ...baseSpecs,
      fontWeight: "bold",
      marginLeft: 8,
      marginRight: 8,
    },
    ordered_list_icon: {
      ...baseSpecs,
      fontWeight: "bold",
      marginLeft: 8,
      marginRight: 8,
    },

    fence: {
      backgroundColor: "transparent",
      color: textColor,
      borderWidth: 0,
      borderColor: "transparent",
      padding: 10,
      marginTop: 8,
      marginBottom: 8,
      fontFamily: baseSpecs.fontFamily,
      fontSize: baseSpecs.fontSize * 0.85,
    },

    link: {
      color: "#7dd3fc",
      textDecorationLine: PLATFORM.IS_WEB ? "none" : "underline",
      textDecorationColor: "#7dd3fc",
      opacity: 0.9,
    },

    text: {
      fontFamily: baseSpecs.fontFamily,
      fontSize: baseSpecs.fontSize,
    },
    strong: { fontWeight: "bold" },
    em: { fontStyle: "italic" },
    del: { textDecorationLine: "line-through" },
  };
};
