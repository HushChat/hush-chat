import React, { useMemo } from "react";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import { PLATFORM } from "@/constants/platformConstants";
import WebContextMenu from "@/components/WebContextMenu";
import { useMarkdownRules } from "@/hooks/formattedText/useMarkdownRules";
import { useLinkHandler } from "@/hooks/formattedText/useLinkHandler";
import { useWebContextMenu } from "@/hooks/formattedText/useWebContextMenu";
import { useMarkdownStyles } from "@/hooks/formattedText/useMarkdownStyles";
import { useProcessedText } from "@/hooks/formattedText/useProcessedText";
import { usePlainTextParser } from "@/hooks/formattedText/usePlainTextParser";
import { TUser } from "@/types/user/types";
import { AppText } from "@/components/AppText";
import classNames from "classnames";

export interface FormattedTextProps {
  text: string;
  mentions?: TUser[];
  onLinkPress?: (url: string) => void;
  onEmailPress?: (email: string) => void;
  onPhonePress?: (phone: string) => void;
  onMentionPress?: (username: string) => void;
  onHashtagPress?: (hashtag: string) => void;
  isCurrentUser: boolean;
  isMarkdownEnabled?: boolean;
  isGroup?: boolean;
}

const FormattedText = (props: FormattedTextProps) => {
  const { text, mentions = [], isCurrentUser, isMarkdownEnabled, isGroup } = props;

  const { markdownStyles } = useMarkdownStyles(isCurrentUser);
  const handleLinkPress = useLinkHandler(props);
  const { menuVisible, menuPos, openMenu, closeMenu, copyLink, copyText } = useWebContextMenu();
  const rules = useMarkdownRules(handleLinkPress, isCurrentUser, openMenu);

  const processedText = useProcessedText(text, mentions, isGroup);
  const plainTextContent = usePlainTextParser(text, mentions, rules, markdownStyles, isGroup);

  const markdownItInstance = useMemo(() => MarkdownIt({ linkify: true, typographer: true }), []);

  const contextMenu = PLATFORM.IS_WEB && (
    <WebContextMenu
      visible={menuVisible}
      position={menuPos}
      onClose={closeMenu}
      options={[
        {
          id: 1,
          name: "Copy link address",
          iconName: "copy-outline",
          action: copyLink,
        },
        ...(isMarkdownEnabled
          ? [
              {
                id: 2,
                name: "Copy text",
                iconName: "text-outline" as const,
                action: copyText,
              },
            ]
          : []),
      ]}
      iconSize={18}
      onOptionSelect={(action: any) => action()}
    />
  );

  if (!isMarkdownEnabled) {
    return (
      <>
        <AppText
          className={classNames("text-base leading-6", {
            "text-white": isCurrentUser,
            "text-gray-900 dark:text-gray-100": !isCurrentUser,
          })}
        >
          {plainTextContent}
        </AppText>
        {contextMenu}
      </>
    );
  }

  return (
    <>
      <Markdown style={markdownStyles} rules={rules} markdownit={markdownItInstance}>
        {processedText}
      </Markdown>
      {contextMenu}
    </>
  );
};

export default FormattedText;
