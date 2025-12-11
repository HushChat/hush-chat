import { TUser } from "@/types/user/types";
import { useMemo } from "react";
import { HASHTAG_REGEX, MENTION_REGEX, PHONE_REGEX } from "@/constants/regex";

export const useProcessedText = (text: string, mentions: TUser[]) => {
  return useMemo(() => {
    const splitRegex = /(`{3}[\s\S]*?`{3}|`[^`]+`)/g;
    const parts = text.split(splitRegex);

    return parts
      .map((part) => {
        if (part.startsWith("`")) return part;

        let newPart = part;

        const globalMentionRegex = new RegExp(MENTION_REGEX.source, "g");

        newPart = newPart.replace(globalMentionRegex, (match, space, username, punctuation) => {
          const cleanUsername = username.replace(/\.$/, "");
          const finalPunctuation = (username.endsWith(".") ? "." : "") + (punctuation || "");

          const isValid = mentions?.some(
            (m) => m.username.toLowerCase() === cleanUsername.toLowerCase()
          );

          return isValid
            ? `${space}[@${cleanUsername}](mention:${cleanUsername})${finalPunctuation}`
            : match;
        });

        const globalHashtagRegex = new RegExp(HASHTAG_REGEX.source, "gi");

        newPart = newPart.replace(globalHashtagRegex, (match, space, hashtag) => {
          const cleanTag = hashtag.replace("#", "");
          return `${space || ""}[${hashtag}](hashtag:${cleanTag})`;
        });

        const strictPhoneRegex = new RegExp(`(^|\\s)(${PHONE_REGEX.source})`, "g");

        newPart = newPart.replace(strictPhoneRegex, (match, space, number) => {
          const cleanNumber = number.replace(/[^0-9+]/g, "");
          return `${space}[${number}](tel:${cleanNumber})`;
        });

        return newPart;
      })
      .join("");
  }, [text, mentions]);
};
