import React, { useCallback, useMemo, useState } from "react";
import { Linking, TextStyle, Text } from "react-native";
import ParsedText, { ParseShape } from "react-native-parsed-text";
import classNames from "classnames";
import { TUser } from "@/types/user/types";
import { HASHTAG_REGEX, MENTION_REGEX } from "@/constants/regex";
import { PLATFORM } from "@/constants/platformConstants";
import { copyToClipboard } from "@/utils/messageUtils";
import WebContextMenu from "@/components/WebContextMenu";
import { IOption } from "@/types/chat/types";

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

  const handleUrlPress = useCallback(
    async (url: string) => {
      const finalUrl = url.startsWith("http") ? url : `https://${url}`;
      if (onLinkPress) return onLinkPress(finalUrl);
      if (await Linking.canOpenURL(finalUrl)) await Linking.openURL(finalUrl);
    },
    [onLinkPress]
  );

  const handleUrlContextMenu = useCallback(
    (url: string) => (event: any) => {
      event.preventDefault();
      setMenuPos({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
      setSelectedUrl(url);
      setMenuVisible(true);
    },
    []
  );

  const handleEmailPress = useCallback((email: string) => onEmailPress?.(email), [onEmailPress]);
  const handlePhonePress = useCallback((phone: string) => onPhonePress?.(phone), [onPhonePress]);
  const handleHashtagPress = useCallback(
    (hashtag: string) => onHashtagPress?.(hashtag.replace("#", "")),
    [onHashtagPress]
  );
  const handleMentionPress = useCallback(
    (mention: string) => {
      const username = mention.replace(MENTION_REGEX, "");
      if (mentions.some((m) => m.username === username)) {
        onMentionPress?.(username);
      }
    },
    [mentions, onMentionPress]
  );

  const linkMenuOptions = useMemo<IOption[]>(
    () => [
      {
        id: 1,
        name: "Copy link address",
        iconName: "copy-outline",
        action: async () => {
          const finalUrl = selectedUrl.startsWith("http") ? selectedUrl : `https://${selectedUrl}`;
          await copyToClipboard(finalUrl);
          setMenuVisible(false);
        },
      },
    ],
    [selectedUrl]
  );

  const parse = useMemo<ParseShape[]>(
    () => [
      {
        type: "url",
        renderText: ((matchingString: string) => (
          <Text
            onPress={() => handleUrlPress(matchingString)}
            {...(PLATFORM.IS_WEB && {
              onContextMenu: handleUrlContextMenu(matchingString),
            })}
            className={PLATFORM.IS_WEB ? "hover:underline hover:decoration-[#7dd3fc]" : undefined}
            style={{
              textDecorationLine: PLATFORM.IS_WEB ? undefined : "underline",
              color: "#7dd3fc",
              opacity: 0.9,
            }}
          >
            {matchingString}
          </Text>
        )) as any,
      },
      {
        type: "email",
        onPress: handleEmailPress,
        style: {
          textDecorationLine: "underline",
          color: "#7dd3fc",
          opacity: 0.9,
        },
      },
      {
        type: "phone",
        onPress: handlePhonePress,
        style: {
          textDecorationLine: "underline",
          color: "#7dd3fc",
          opacity: 0.9,
        },
      },
      {
        pattern: HASHTAG_REGEX,
        onPress: handleHashtagPress,
        style: { color: "#ddd6fe", fontWeight: "500", opacity: 0.9 },
      },
      {
        pattern: MENTION_REGEX,
        onPress: handleMentionPress,
        style: isCurrentUser
          ? { fontWeight: "700", borderRadius: 4, color: "#beb4e8" }
          : { fontWeight: "700", borderRadius: 4, color: "#6366f1" },
      },
    ],
    [
      handleEmailPress,
      handleHashtagPress,
      handleMentionPress,
      handlePhonePress,
      handleUrlPress,
      isCurrentUser,
      handleUrlContextMenu,
    ]
  );

  return (
    <>
      <ParsedText
        style={style}
        className={classNames(
          "text-base text-text-primary-light dark:text-text-primary-dark",
          isCurrentUser ? "text-white" : "",
          className
        )}
        parse={parse}
        childrenProps={{ allowFontScaling: false }}
      >
        {text}
      </ParsedText>

      {PLATFORM.IS_WEB && (
        <WebContextMenu
          visible={menuVisible}
          position={menuPos}
          onClose={() => setMenuVisible(false)}
          options={linkMenuOptions}
          iconSize={18}
          onOptionSelect={async (action: any) => action()}
        />
      )}
    </>
  );
};

export default FormattedText;
