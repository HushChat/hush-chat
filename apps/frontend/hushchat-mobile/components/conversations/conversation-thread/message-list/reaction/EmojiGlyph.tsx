import React from "react";
import { Text, TextProps } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";

type Props = TextProps & { size?: number; children: string };

export default function EmojiGlyph({ size = 24, style, children, ...rest }: Props) {
  const lineHeight = Math.round(size * 1.2);

  return (
    <Text
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
    </Text>
  );
}
