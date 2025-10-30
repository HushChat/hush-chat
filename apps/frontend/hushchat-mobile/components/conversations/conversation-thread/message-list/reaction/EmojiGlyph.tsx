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

import React from "react";
import { Text, TextProps } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";

type Props = TextProps & { size?: number; children: string };

export default function EmojiGlyph({
  size = 24,
  style,
  children,
  ...rest
}: Props) {
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
