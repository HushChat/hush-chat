import Markdown, { MarkdownIt } from "react-native-markdown-display";
import { PLATFORM } from "@/constants/platformConstants";
import WebContextMenu from "@/components/WebContextMenu";
import { useMemo } from "react";
import { useMarkdownRules } from "@/hooks/formattedText/useMarkdownRules";
import { useLinkHandler } from "@/hooks/formattedText/useLinkHandler";
import { useWebContextMenu } from "@/hooks/formattedText/useWebContextMenu";
import { useMarkdownStyles } from "@/hooks/formattedText/useMarkdownStyles";
import { useProcessedText } from "@/hooks/formattedText/useProcessedText";
import { TUser } from "@/types/user/types";

export interface FormattedTextProps {
  text: string;
  mentions?: TUser[];
  onLinkPress?: (url: string) => void;
  onEmailPress?: (email: string) => void;
  onPhonePress?: (phone: string) => void;
  onMentionPress?: (username: string) => void;
  onHashtagPress?: (hashtag: string) => void;
  isCurrentUser: boolean;
}

const FormattedText = (props: FormattedTextProps) => {
  const { text, mentions = [], isCurrentUser } = props;

  const processedText = useProcessedText(text, mentions);

  const { markdownStyles } = useMarkdownStyles(isCurrentUser);

  const handleLinkPress = useLinkHandler(props);
  const { menuVisible, menuPos, openMenu, closeMenu, copyLink } = useWebContextMenu();

  const rules = useMarkdownRules(handleLinkPress, isCurrentUser, openMenu);
  const markdownItInstance = useMemo(() => MarkdownIt({ linkify: true, typographer: true }), []);

  return (
    <>
      <Markdown style={markdownStyles} rules={rules} markdownit={markdownItInstance}>
        {processedText}
      </Markdown>

      {PLATFORM.IS_WEB && (
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
          ]}
          iconSize={18}
          onOptionSelect={(action: any) => action()}
        />
      )}
    </>
  );
};

export default FormattedText;
