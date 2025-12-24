import { useMemo } from "react";
import { AppText } from "@/components/AppText";
import { MarkdownImage } from "@/components/MarkdownImage";
import { PLATFORM } from "@/constants/platformConstants";

interface ASTNode {
  key: string;
  attributes: Record<string, any>;
  children: ASTNode[];
  content: string;
  type: string;
}

export const useMarkdownRules = (
  handleLinkPress: (url: string) => void,
  isCurrentUser: boolean,
  onWebContextMenu: (e: any, url: string) => void,
  onMentionPress?: (username: string) => void
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
        let isMention = false;

        if (url.startsWith("mention:")) {
          isSpecial = true;
          isMention = true;
          activeStyle = {
            color: isCurrentUser ? "#beb4e8" : "#6366f1",
            fontWeight: "700",
            borderRadius: 4,
            textDecorationLine: "none",
            fontSize: 16,
          };
        } else if (url.startsWith("hashtag:")) {
          isSpecial = true;
          activeStyle = {
            color: "#ddd6fe",
            fontWeight: "500",
            textDecorationLine: "none",
            fontSize: 16,
          };
        } else if (url.startsWith("tel:")) {
          activeStyle = {
            ...activeStyle,
            textDecorationLine: "none",
          };
        }

        const content = isSpecial ? node.children.map((child) => child.content).join("") : children;
        const isHoverable = PLATFORM.IS_WEB && !isSpecial;

        const handlePress = () => {
          if (isMention && onMentionPress) {
            const username = url.replace("mention:", "");
            onMentionPress(username);
          } else {
            handleLinkPress(url);
          }
        };

        return (
          <AppText
            key={node.key}
            style={activeStyle}
            onPress={handlePress}
            className={isHoverable ? "hover:underline hover:decoration-[#7dd3fc]" : ""}
            {...(isHoverable && { onContextMenu: (e: any) => onWebContextMenu(e, url) })}
          >
            {content}
          </AppText>
        );
      },
    }),
    [handleLinkPress, isCurrentUser, onWebContextMenu, onMentionPress]
  );
};
