import { TUser } from "@/types/user/types";
import { useMemo } from "react";
import { HASHTAG_REGEX, MENTION_REGEX, PHONE_REGEX } from "@/constants/regex";

export const useProcessedText = (text: string, mentions: TUser[]) => {
  return useMemo(() => {
    let newText = text;

    const globalMentionRegex = new RegExp(MENTION_REGEX.source, "g");

    newText = newText.replace(globalMentionRegex, (match) => {
      const username = match.replace(/^@/, "");

      return mentions?.some((m) => m.username === username)
        ? `[${match}](mention:${username})`
        : match;
    });

    newText = newText.replace(HASHTAG_REGEX, (match, space, hashtag) => {
      const cleanTag = hashtag.replace("#", "");
      return `${space || ""}[${hashtag}](hashtag:${cleanTag})`;
    });

    const globalPhoneRegex = new RegExp(PHONE_REGEX.source, "g");

    newText = newText.replace(globalPhoneRegex, (match) => {
      const cleanNumber = match.replace(/[^0-9+]/g, "");
      return `[${match}](tel:${cleanNumber})`;
    });

    return newText;
  }, [text, mentions]);
};
