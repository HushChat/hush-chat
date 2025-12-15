import { Linking } from "react-native";
import { useCallback } from "react";
import { normalizeUrl } from "@/utils/messageUtils";
import { FormattedTextProps } from "@/components/FormattedText";

export const useLinkHandler = (props: Partial<FormattedTextProps>) => {
  return useCallback(
    async (url: string) => {
      if (url.startsWith("mention:")) return props.onMentionPress?.(url.replace("mention:", ""));
      if (url.startsWith("hashtag:")) return props.onHashtagPress?.(url.replace("hashtag:", ""));
      if (url.startsWith("mailto:")) return props.onEmailPress?.(url.replace("mailto:", ""));
      if (url.startsWith("tel:")) return props.onPhonePress?.(url.replace("tel:", ""));

      const finalUrl = normalizeUrl(url);
      if (!finalUrl) return;

      if (props.onLinkPress) props.onLinkPress(finalUrl);
      else if (await Linking.canOpenURL(finalUrl)) await Linking.openURL(finalUrl);
    },
    [
      props.onLinkPress,
      props.onMentionPress,
      props.onHashtagPress,
      props.onEmailPress,
      props.onPhonePress,
    ]
  );
};
