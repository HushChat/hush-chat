import React from "react";
import { TextProps } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";
import { AppText } from "@/components/AppText";

type Props = TextProps & { size?: number; children: string };

export default function EmojiGlyph({ size = 24, style, children, ...rest }: Props) {
  const lineHeight = Math.round(size * 1.2);

  return (
    <AppText
      {...rest}
      allowFontScaling={false}
      style={[
        {
          fontSize: size,
          lineHeight,
          ...(!PLATFORM.IS_WEB
            ? { fontFamily: undefined, includeFontPadding: false }
            : { fontFamily: undefined }),
        },
        style,
      ]}
    >
      {children}
    </AppText>
  );
}
