import { TUser } from "@/types/user/types";
import { useMemo } from "react";
import { HASHTAG_REGEX, MENTION_REGEX, PHONE_REGEX } from "@/constants/regex";

export const useProcessedText = (text: string, mentions: TUser[]) => {
  return useMemo(() => {
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
};
