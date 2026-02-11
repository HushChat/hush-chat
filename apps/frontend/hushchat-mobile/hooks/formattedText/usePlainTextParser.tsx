import React, { useMemo } from "react";
import { URL_REGEX, MENTION_REGEX, EMAIL_REGEX } from "@/constants/regex";
import { TUser } from "@/types/user/types";

export const usePlainTextParser = (
  text: string,
  mentions: TUser[],
  rules: Record<string, any>,
  styles: Record<string, any>
) => {
  return useMemo(() => {
    const emailParts = text.split(EMAIL_REGEX);

    return emailParts.map((emailPart, emailIndex) => {
      const isEmail = EMAIL_REGEX.test(emailPart);

      if (isEmail) {
        const mockNode = {
          key: `email-${emailIndex}`,
          attributes: { href: `mailto:${emailPart}` },
          children: [{ content: emailPart }],
        };
        return rules.link(mockNode, emailPart, styles);
      }

      const urlParts = emailPart.split(URL_REGEX);

      return urlParts.map((urlPart, urlIndex) => {
        const isUrl = URL_REGEX.test(urlPart);

        if (isUrl) {
          const mockNode = {
            key: `url-${emailIndex}-${urlIndex}`,
            attributes: { href: urlPart },
            children: [{ content: urlPart }],
          };
          return rules.link(mockNode, urlPart, styles);
        }

        const mentionRegex = new RegExp(MENTION_REGEX.source, "g");
        const tokens: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        while ((match = mentionRegex.exec(urlPart)) !== null) {
          const space = match[1] || "";
          const username = match[2];
          const punctuation = match[3] || "";

          const cleanUsername = username.replace(/\.$/, "");
          const finalPunctuation = (username.endsWith(".") ? "." : "") + punctuation;

          const isValid = mentions?.some(
            (m) => m.username.toLowerCase() === cleanUsername.toLowerCase()
          );

          const beforeText = urlPart.substring(lastIndex, match.index) + space;
          if (beforeText) {
            tokens.push(
              <React.Fragment key={`text-${emailIndex}-${urlIndex}-${lastIndex}`}>
                {beforeText}
              </React.Fragment>
            );
          }

          if (isValid) {
            const mockNode = {
              key: `mention-${emailIndex}-${urlIndex}-${match.index}`,
              attributes: { href: `mention:${cleanUsername}` },
              children: [{ content: `@${cleanUsername}` }],
            };

            tokens.push(rules.link(mockNode, `@${cleanUsername}`, styles));

            if (finalPunctuation) {
              tokens.push(
                <React.Fragment key={`punc-${emailIndex}-${urlIndex}-${match.index}`}>
                  {finalPunctuation}
                </React.Fragment>
              );
            }
          } else {
            tokens.push(
              <React.Fragment key={`raw-${emailIndex}-${urlIndex}-${match.index}`}>
                {match[0].substring(space.length)}
              </React.Fragment>
            );
          }

          lastIndex = mentionRegex.lastIndex;
        }

        const remainingText = urlPart.substring(lastIndex);
        if (remainingText) {
          tokens.push(
            <React.Fragment key={`rem-${emailIndex}-${urlIndex}-${lastIndex}`}>
              {remainingText}
            </React.Fragment>
          );
        }

        return tokens.length > 0 ? tokens : urlPart;
      });
    });
  }, [text, mentions, rules, styles]);
};
