/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useCallback, useMemo } from "react";
import { Linking, TextStyle } from "react-native";
import ParsedText, { ParseShape } from "react-native-parsed-text";
import classNames from "classnames";
import { TUser } from "@/types/user/types";
import { HASHTAG_REGEX, MENTION_REGEX } from "@/constants/regex";

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
  const handleUrlPress = useCallback(
    async (url: string) => {
      const finalUrl = url.startsWith("http") ? url : `https://${url}`;
      if (onLinkPress) return onLinkPress(finalUrl);
      if (await Linking.canOpenURL(finalUrl)) await Linking.openURL(finalUrl);
    },
    [onLinkPress],
  );
  const handleEmailPress = useCallback(
    (email: string) => onEmailPress?.(email),
    [onEmailPress],
  );
  const handlePhonePress = useCallback(
    (phone: string) => onPhonePress?.(phone),
    [onPhonePress],
  );
  const handleHashtagPress = useCallback(
    (hashtag: string) => onHashtagPress?.(hashtag.replace("#", "")),
    [onHashtagPress],
  );
  const handleMentionPress = useCallback(
    (mention: string) => {
      const username = mention.replace(MENTION_REGEX, "");
      if (mentions.some((m) => m.username === username)) {
        onMentionPress?.(username);
      }
    },
    [mentions, onMentionPress],
  );

  const parse = useMemo<ParseShape[]>(
    () => [
      {
        type: "url",
        onPress: handleUrlPress,
        style: {
          textDecorationLine: "underline",
          color: "#7dd3fc",
          opacity: 0.9,
        },
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
    ],
  );

  return (
    <ParsedText
      style={style}
      className={classNames(
        "text-base text-text-primary-light dark:text-text-primary-dark",
        isCurrentUser ? "text-white" : "",
        className,
      )}
      parse={parse}
      childrenProps={{ allowFontScaling: false }}
    >
      {text}
    </ParsedText>
  );
};

export default FormattedText;
