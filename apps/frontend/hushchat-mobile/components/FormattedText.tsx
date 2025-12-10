import React, { useCallback, useMemo, useState } from "react";
import { Linking, TextStyle, StyleSheet } from "react-native";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import { TUser } from "@/types/user/types";
import { HASHTAG_REGEX, MENTION_REGEX, PHONE_REGEX } from "@/constants/regex";
import { PLATFORM } from "@/constants/platformConstants";
import { copyToClipboard, normalizeUrl } from "@/utils/messageUtils";
import WebContextMenu from "@/components/WebContextMenu";
import { MarkdownImage } from "@/components/MarkdownImage";
import { AppText } from "@/components/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getMarkdownStyles } from "@/styles/markdown.styles";

interface ASTNode {
  key: string;
  attributes: Record<string, any>;
  children: ASTNode[];
  content: string;
  type: string;
}

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

const FormattedText = ({
  text,
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
  const { isDark } = useAppTheme();

  const flatStyle = useMemo(() => StyleSheet.flatten(style || {}), [style]);

  const markdownItInstance = useMemo(() => MarkdownIt({ linkify: true, typographer: true }), []);

  const textColor = useMemo(() => {
    if (flatStyle.color) return flatStyle.color as string;
    if (isCurrentUser) return "#FFFFFF";
    return isDark ? "#EDEDED" : "#333333";
  }, [flatStyle.color, isCurrentUser, isDark]);

  const baseSpecs = useMemo(
    () => ({
      fontFamily: flatStyle.fontFamily || "Poppins-Regular",
      fontSize: flatStyle.fontSize || 16,
      lineHeight: flatStyle.lineHeight || 22,
      color: textColor,
    }),
    [flatStyle, textColor]
  );

  const markdownStyles = useMemo(() => {
    return getMarkdownStyles(baseSpecs);
  }, [baseSpecs]);

  const processedText = useMemo(() => {
    let newText = text;

    newText = newText.replace(MENTION_REGEX, (match) => {
      const username = match.replace(/^@/, "");
      return mentions?.some((m) => m.username === username)
        ? `[${match}](mention:${username})`
        : match;
    });

    newText = newText.replace(HASHTAG_REGEX, (match, space, hashtag) => {
      const cleanTag = hashtag.replace("#", "");
      return `${space}[${hashtag}](hashtag:${cleanTag})`;
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

  // read `https://github.com/iamacup/react-native-markdown-display/blob/master/src/lib/renderRules.js` for rules
  const rules = useMemo(
    () => ({
      paragraph: (node: ASTNode, children: React.ReactNode, styles: Record<string, any>) => (
        <AppText key={node.key} style={styles.paragraph}>
          {children}
        </AppText>
      ),

      image: (node: ASTNode) => {
        const { src, alt } = node.attributes;
        return <MarkdownImage key={node.key} src={src} alt={alt} />;
      },

      bullet_list: (node: ASTNode, children: React.ReactNode, styles: Record<string, any>) => (
        <AppText key={node.key} style={styles.bullet_list}>
          {children}
        </AppText>
      ),

      ordered_list: (node: ASTNode, children: React.ReactNode, styles: Record<string, any>) => (
        <AppText key={node.key} style={styles.ordered_list}>
          {children}
        </AppText>
      ),

      link: (node: ASTNode, children: React.ReactNode, styles: Record<string, any>) => {
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

        const content = isSpecial ? node.children.map((child) => child.content).join("") : children;

        return (
          <AppText
            key={node.key}
            style={activeStyle}
            onPress={() => handleLinkPress(url)}
            className={
              PLATFORM.IS_WEB && !isSpecial ? "hover:underline hover:decoration-[#7dd3fc]" : ""
            }
            {...(PLATFORM.IS_WEB &&
              !isSpecial && {
                onContextMenu: (e: any) => {
                  e.preventDefault();
                  setMenuPos({
                    x: e.nativeEvent.pageX,
                    y: e.nativeEvent.pageY,
                  });
                  setSelectedUrl(url);
                  setMenuVisible(true);
                },
              })}
          >
            {content}
          </AppText>
        );
      },
    }),
    [handleLinkPress, isCurrentUser, baseSpecs]
  );

  return (
    <>
      <Markdown style={markdownStyles} rules={rules} markdownit={markdownItInstance}>
        {processedText}
      </Markdown>

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
