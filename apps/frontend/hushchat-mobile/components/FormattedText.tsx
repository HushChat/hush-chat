import React, { useCallback, useMemo, useState } from "react";
import {
  Linking,
  TextStyle,
  StyleSheet,
  View,
  useWindowDimensions,
  Platform,
  Text,
} from "react-native";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import { TUser } from "@/types/user/types";
import { HASHTAG_REGEX, MENTION_REGEX, PHONE_REGEX } from "@/constants/regex";
import { PLATFORM } from "@/constants/platformConstants";
import { copyToClipboard, normalizeUrl } from "@/utils/messageUtils";
import WebContextMenu from "@/components/WebContextMenu";
import { MarkdownImage } from "@/components/MarkdownImage";

interface FormattedTextProps {
  text: string;
  className?: string;
  style?: TextStyle | TextStyle[];
  mentions?: TUser[];
  onLinkPress?: (url: string) => void;
  onEmailPress?: (email: string) => void;
  onPhonePress?: (phone: string) => void;
  onMentionPress?: (username: string) => void;
  onHashtagPress?: (hashtag: string) => void;
  isCurrentUser: boolean;
}

const LINK_COLOR = "#7dd3fc";

const FormattedText = ({
  text,
  className,
  style,
  mentions = [],
  onLinkPress,
  onEmailPress,
  onPhonePress,
  onMentionPress,
  onHashtagPress,
  isCurrentUser,
}: FormattedTextProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [selectedUrl, setSelectedUrl] = useState<string>("");

  const { width: screenWidth } = useWindowDimensions();

  const flatStyle = useMemo(() => StyleSheet.flatten(style || {}), [style]);

  const markdownItInstance = useMemo(() => MarkdownIt({ linkify: true, typographer: true }), []);

  const baseSpecs = useMemo(
    () => ({
      fontFamily: flatStyle.fontFamily || "Poppins-Regular",
      fontSize: flatStyle.fontSize || 16,
      lineHeight: flatStyle.lineHeight || 22,
      color: flatStyle.color || (isCurrentUser ? "#FFFFFF" : "#333333"),
    }),
    [flatStyle, isCurrentUser]
  );

  const markdownStyles = useMemo(() => {
    const codeFontFamily = Platform.OS === "ios" ? "Menlo" : "monospace";

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
        width: "100%",
        color: baseSpecs.color,
      },

      heading1: { ...baseSpecs, fontSize: 24, fontWeight: "bold", marginBottom: 8, marginTop: 4 },
      heading2: { ...baseSpecs, fontSize: 20, fontWeight: "bold", marginBottom: 8, marginTop: 4 },

      list_item: { marginVertical: 2 },
      bullet_list: { marginBottom: 8 },
      ordered_list: { marginBottom: 8 },
      bullet_list_icon: { ...baseSpecs, fontWeight: "bold", marginLeft: 8, marginRight: 8 },
      ordered_list_icon: { ...baseSpecs, fontWeight: "bold", marginLeft: 8, marginRight: 8 },

      blockquote: {
        borderLeftColor: isCurrentUser ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.2)",
        borderLeftWidth: 3,
        paddingLeft: 8,
        opacity: 0.9,
      },

      fence: {
        backgroundColor: "#2e2e2e",
        color: "#e6e6e6",
        borderRadius: 8,
        padding: 10,
        marginTop: 8,
        marginBottom: 8,
        fontFamily: codeFontFamily,
        fontSize: baseSpecs.fontSize * 0.85,
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
      },

      code_block: {
        backgroundColor: "#2e2e2e",
        color: "#e6e6e6",
        borderRadius: 8,
        padding: 10,
        marginTop: 8,
        marginBottom: 8,
        fontFamily: codeFontFamily,
        fontSize: baseSpecs.fontSize * 0.85,
      },

      code_inline: {
        backgroundColor: isCurrentUser ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.1)",
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
        fontFamily: codeFontFamily,
        fontSize: baseSpecs.fontSize * 0.9,
        color: baseSpecs.color,
      },

      link: {
        color: LINK_COLOR,
        textDecorationLine: PLATFORM.IS_WEB ? "none" : "underline",
        textDecorationColor: LINK_COLOR,
        opacity: 0.9,
      },

      text: {
        fontFamily: baseSpecs.fontFamily,
        fontSize: baseSpecs.fontSize,
      },
      strong: { fontWeight: "bold" },
      em: { fontStyle: "italic" },
      del: { textDecorationLine: "line-through" },

      table: {
        borderColor: isCurrentUser ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)",
        borderWidth: 1,
        borderRadius: 4,
      },
      tr: {
        borderBottomWidth: 1,
        borderColor: isCurrentUser ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
        flexDirection: "row",
      },
      th: {
        padding: 8,
        fontWeight: "bold",
        backgroundColor: isCurrentUser ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      },
      td: {
        padding: 8,
      },
    };
  }, [baseSpecs, isCurrentUser]);

  const processedText = useMemo(() => {
    let newText = text;
    newText = newText.replace(MENTION_REGEX, (match) => {
      const username = match.replace(/^@/, "");
      return mentions?.some((m) => m.username === username)
        ? `[${match}](mention:${username})`
        : match;
    });
    newText = newText.replace(HASHTAG_REGEX, (match) => {
      return `[${match}](hashtag:${match.replace("#", "")})`;
    });

    newText = newText.replace(PHONE_REGEX, (match) => {
      const cleanNumber = match.replace(/[^0-9+]/g, "");
      return `[${match}](tel:${cleanNumber})`;
    });

    return newText;
  }, [text, mentions]);

  const handleLinkPress = useCallback(
    async (url: string) => {
      if (url.startsWith("mention:")) return onMentionPress?.(url.replace("mention:", ""));
      if (url.startsWith("hashtag:")) return onHashtagPress?.(url.replace("hashtag:", ""));
      if (url.startsWith("mailto:")) return onEmailPress?.(url.replace("mailto:", ""));
      if (url.startsWith("tel:")) return onPhonePress?.(url.replace("tel:", ""));

      const finalUrl = normalizeUrl(url);
      if (!finalUrl) return;

      if (onLinkPress) onLinkPress(finalUrl);
      else if (await Linking.canOpenURL(finalUrl)) await Linking.openURL(finalUrl);
    },
    [onLinkPress, onMentionPress, onHashtagPress, onEmailPress, onPhonePress]
  );

  const rules = useMemo(
    () => ({
      image: (node: any) => {
        const { src, alt } = node.attributes;
        return <MarkdownImage key={node.key} src={src} alt={alt} />;
      },

      link: (node: any, children: any, parent: any, styles: any) => {
        const url = node.attributes.href;
        let activeStyle = styles.link;
        let isSpecial = false;

        if (url.startsWith("mention:")) {
          isSpecial = true;
          activeStyle = {
            color: isCurrentUser ? "#beb4e8" : "#6366f1",
            fontWeight: "700",
            borderRadius: 4,
            textDecorationLine: "none",
            fontFamily: baseSpecs.fontFamily,
            fontSize: baseSpecs.fontSize,
          };
        } else if (url.startsWith("hashtag:")) {
          isSpecial = true;
          activeStyle = {
            color: "#ddd6fe",
            fontWeight: "500",
            textDecorationLine: "none",
            fontFamily: baseSpecs.fontFamily,
            fontSize: baseSpecs.fontSize,
          };
        }

        return (
          <Text
            key={node.key}
            style={activeStyle}
            onPress={() => handleLinkPress(url)}
            className={
              PLATFORM.IS_WEB && !isSpecial
                ? "hover:underline hover:decoration-[#7dd3fc]"
                : undefined
            }
            {...(PLATFORM.IS_WEB &&
              !isSpecial && {
                onContextMenu: (e: any) => {
                  e.preventDefault();
                  setMenuPos({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
                  setSelectedUrl(url);
                  setMenuVisible(true);
                },
              })}
          >
            {children}
          </Text>
        );
      },

      s: (node: any, children: any, styles: any) => {
        return (
          <Text key={node.key} style={styles.del}>
            {children}
          </Text>
        );
      },
    }),
    [handleLinkPress, isCurrentUser, screenWidth, baseSpecs]
  );

  return (
    <>
      <View className={className} style={{ flexShrink: 1 }}>
        <Markdown style={markdownStyles as any} rules={rules} markdownit={markdownItInstance}>
          {processedText}
        </Markdown>
      </View>

      {PLATFORM.IS_WEB && (
        <WebContextMenu
          visible={menuVisible}
          position={menuPos}
          onClose={() => setMenuVisible(false)}
          options={[
            {
              id: 1,
              name: "Copy link address",
              iconName: "copy-outline",
              action: async () => {
                const finalUrl = normalizeUrl(selectedUrl);
                if (finalUrl) await copyToClipboard(finalUrl);
                setMenuVisible(false);
              },
            },
          ]}
          iconSize={18}
          onOptionSelect={async (action: any) => action()}
        />
      )}
    </>
  );
};

export default FormattedText;
