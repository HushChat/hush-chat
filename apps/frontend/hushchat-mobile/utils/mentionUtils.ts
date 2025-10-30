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

import type { RefObject } from "react";
import type { TextInput } from "react-native";
import { MENTION_PREFIX } from "@/constants/constants";
import { MENTION_TOKEN_REGEX } from "@/constants/regex";

export function setCaretPosition(
  ref: RefObject<TextInput | null>,
  index: number,
) {
  ref.current?.setSelection?.(index, index);
}

/**
 * Detect an '@' mention token that is immediately before the caret.
 * Returns the query AFTER '@' ('' means show all), or null if no token.
 */
export function detectMentionToken(text: string, caret: number): string | null {
  const effectiveCaret = Math.min(text.length, caret + 1);

  const uptoCaret = text.slice(0, effectiveCaret);
  const match = uptoCaret.match(MENTION_TOKEN_REGEX);
  if (!match) return null;

  const token = match[2] ?? "";
  return token.startsWith(MENTION_PREFIX)
    ? token.slice(MENTION_PREFIX.length)
    : null;
}

/**
 * Replace the active '@token' at the caret with a concrete '@username'
 * and ensure exactly one trailing space. Returns next text and caret.
 */
export function replaceMentionAtCaret(
  text: string,
  caret: number,
  username: string,
): { nextText: string; nextCaret: number } {
  const uptoCaret = text.slice(0, caret);
  const afterCaret = text.slice(caret);
  const tokenMatch = uptoCaret.match(MENTION_TOKEN_REGEX);
  if (!tokenMatch) {
    // No token found, insert at caret followed by a space
    const inserted = `${MENTION_PREFIX}${username} `;
    const nextText = `${uptoCaret}${inserted}${afterCaret}`;
    const nextCaret = uptoCaret.length + inserted.length;
    return { nextText, nextCaret };
  }

  const tokenStartIdx = (tokenMatch.index ?? 0) + (tokenMatch[1]?.length ?? 0);
  const beforeToken = text.slice(0, tokenStartIdx);
  const inserted = `${MENTION_PREFIX}${username}`;

  // Ensure exactly one space after the inserted mention
  const needsSpace = afterCaret.length === 0 || !afterCaret.startsWith(" ");
  const tail = needsSpace ? ` ${afterCaret}` : afterCaret.replace(/^ +/, " ");

  const nextText = `${beforeToken}${inserted}${tail}`;
  const nextCaret = beforeToken.length + inserted.length + 1; // position after the single space
  return { nextText, nextCaret };
}
