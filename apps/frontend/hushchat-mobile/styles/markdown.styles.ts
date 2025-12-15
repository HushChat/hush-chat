/**
 * Generates custom styles for markdown rendering.
 * * The style object structure matches the default styles used in `react-native-markdown-display`.
 * For reference on available style keys and defaults, see:
 * https://github.com/iamacup/react-native-markdown-display/blob/master/src/lib/styles.js
 */
import { PLATFORM } from "@/constants/platformConstants";
import { StyleSheet, TextStyle } from "react-native";

const messageTextStyles: TextStyle = {
  fontSize: 16,
  lineHeight: 20,
  fontFamily: "Poppins-Regular",
};

export const getMarkdownStyles = (textColor: string) => {
  return StyleSheet.create({
    body: {
      padding: 0,
      margin: 0,
      color: textColor,
      fontFamily: messageTextStyles.fontFamily,
    },

    paragraph: {
      marginTop: 0,
      marginBottom: 8,
      fontSize: messageTextStyles.fontSize,
      lineHeight: messageTextStyles.lineHeight,
    },

    heading1: {
      fontWeight: "bold",
      marginBottom: 8,
    },

    heading2: {
      fontWeight: "bold",
      marginBottom: 8,
    },

    list_item: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginVertical: 2,
      fontSize: messageTextStyles.fontSize,
    },

    ordered_list: { marginBottom: 8 },

    bullet_list_icon: {
      fontSize: messageTextStyles.fontSize,
      fontWeight: "bold",
      marginRight: 8,
    },

    ordered_list_icon: {
      fontSize: messageTextStyles.fontSize,
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
      fontSize: (messageTextStyles.fontSize ?? 16) * 0.85,
    },

    code_inline: {
      borderColor: "transparent",
      backgroundColor: "transparent",
      padding: 2,
      borderRadius: 4,
      fontSize: messageTextStyles.fontSize,
      fontFamily: messageTextStyles.fontFamily,
    },

    code_block: {
      backgroundColor: "transparent",
      borderWidth: 0,
      padding: 10,
      marginTop: 8,
      marginBottom: 8,
      fontSize: messageTextStyles.fontSize,
      fontFamily: messageTextStyles.fontFamily,
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
    s: {
      textDecorationLine: "line-through",
    },
  });
};
