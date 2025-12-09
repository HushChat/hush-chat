import { PLATFORM } from "@/constants/platformConstants";
import { StyleSheet } from "react-native";

type BaseSpecs = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  color: string;
};

export const getMarkdownStyles = (specs: BaseSpecs) => {
  return StyleSheet.create({
    body: {
      padding: 0,
      margin: 0,
      color: specs.color,
      fontFamily: specs.fontFamily,
    },

    paragraph: {
      marginTop: 0,
      marginBottom: 8,
      fontSize: specs.fontSize,
      lineHeight: specs.lineHeight,
    },

    heading1: {
      fontWeight: "bold",
      marginBottom: 8,
      marginTop: 4,
    },

    heading2: {
      fontWeight: "bold",
      marginBottom: 8,
      marginTop: 4,
    },

    list_item: { marginVertical: 2, fontSize: specs.fontSize },
    bullet_list: { marginBottom: 8 },
    ordered_list: { marginBottom: 8 },

    bullet_list_icon: {
      fontSize: specs.fontSize,
      fontWeight: "bold",
      marginLeft: 8,
      marginRight: 8,
    },
    ordered_list_icon: {
      fontSize: specs.fontSize,
      fontWeight: "bold",
      marginLeft: 8,
      marginRight: 8,
    },

    fence: {
      backgroundColor: "transparent",
      borderWidth: 0,
      borderColor: "transparent",
      padding: 10,
      marginTop: 8,
      marginBottom: 8,
      fontSize: specs.fontSize * 0.85,
    },

    link: {
      color: "#7dd3fc",
      textDecorationLine: PLATFORM.IS_WEB ? "none" : "underline",
      textDecorationColor: "#7dd3fc",
      opacity: 0.9,
    },
    strong: { fontWeight: "bold" },
    em: { fontStyle: "italic" },
    del: { textDecorationLine: "line-through" },
  });
};
