import React, { useMemo } from "react";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import { PLATFORM } from "@/constants/platformConstants";
import WebContextMenu from "@/components/WebContextMenu";
import { useMarkdownRules } from "@/hooks/formattedText/useMarkdownRules";
import { useLinkHandler } from "@/hooks/formattedText/useLinkHandler";
import { useWebContextMenu } from "@/hooks/formattedText/useWebContextMenu";
import { useMarkdownStyles } from "@/hooks/formattedText/useMarkdownStyles";
import { useProcessedText } from "@/hooks/formattedText/useProcessedText";
import { TUser } from "@/types/user/types";
import { AppText } from "@/components/AppText";
import classNames from "classnames";
import { URL_REGEX } from "@/constants/regex";

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
}

const FormattedText = (props: FormattedTextProps) => {
  const { text, mentions = [], isCurrentUser, isMarkdownEnabled } = props;

  const processedText = useProcessedText(text, mentions);
  const { markdownStyles } = useMarkdownStyles(isCurrentUser);
  const handleLinkPress = useLinkHandler(props);
  const { menuVisible, menuPos, openMenu, closeMenu, copyLink, copyText } = useWebContextMenu();
  const rules = useMarkdownRules(handleLinkPress, isCurrentUser, openMenu);
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
    const parts = text.split(URL_REGEX);

    return (
      <>
        <AppText
          className={classNames("text-base leading-6", {
            "text-white": isCurrentUser,
            "text-gray-900 dark:text-gray-100": !isCurrentUser,
          })}
        >
          {parts.map((part, index) => {
            const isUrl = URL_REGEX.test(part);

            if (isUrl) {
              return (
                <AppText
                  key={index}
                  style={markdownStyles.link}
                  onPress={() => handleLinkPress(part)}
                  {...(PLATFORM.IS_WEB && {
                    onContextMenu: (e: any) => openMenu(e, part),
                    className: "hover:underline hover:decoration-[#7dd3fc]",
                  })}
                >
                  {part}
                </AppText>
              );
            }

            return <React.Fragment key={index}>{part}</React.Fragment>;
          })}
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
