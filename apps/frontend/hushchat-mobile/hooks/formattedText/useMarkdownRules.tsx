import { useMemo } from "react";
import { AppText } from "@/components/AppText";
import { MarkdownImage } from "@/components/MarkdownImage";
import { PLATFORM } from "@/constants/platformConstants";
import { TextStyle } from "react-native";

interface ASTNode {
  key: string;
  attributes: Record<string, any>;
  children: ASTNode[];
  content: string;
  type: string;
}

export const useMarkdownRules = (
  handleLinkPress: (url: string) => void,
  messageTextStyles: TextStyle,
  isCurrentUser: boolean,
  onWebContextMenu: (e: any, url: string) => void
) => {
  return useMemo(
    () => ({
      paragraph: (node: ASTNode, children: React.ReactNode, styles: Record<string, any>) => (
        <AppText key={node.key} style={styles.paragraph}>
          {children}
        </AppText>
      ),
      image: (node: ASTNode) => <MarkdownImage key={node.key} src={node.attributes.src} />,
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
            fontFamily: messageTextStyles.fontFamily,
            fontSize: messageTextStyles.fontSize,
          };
        } else if (url.startsWith("hashtag:")) {
          isSpecial = true;
          activeStyle = {
            color: "#ddd6fe",
            fontWeight: "500",
            textDecorationLine: "none",
            fontFamily: messageTextStyles.fontFamily,
            fontSize: messageTextStyles.fontSize,
          };
        } else if (url.startsWith("tel:")) {
          activeStyle = {
            ...activeStyle,
            textDecorationLine: "none",
          };
        }

        const content = isSpecial ? node.children.map((child) => child.content).join("") : children;
        const isHoverable = PLATFORM.IS_WEB && !isSpecial;

        return (
          <AppText
            key={node.key}
            style={activeStyle}
            onPress={() => handleLinkPress(url)}
            className={isHoverable ? "hover:underline hover:decoration-[#7dd3fc]" : ""}
            {...(isHoverable && { onContextMenu: (e: any) => onWebContextMenu(e, url) })}
          >
            {content}
          </AppText>
        );
      },
    }),
    [handleLinkPress, isCurrentUser, messageTextStyles, onWebContextMenu]
  );
};
