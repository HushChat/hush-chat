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

import { ReactionType } from "@/types/chat/types";

export const REACTION_META: Record<
  ReactionType,
  { emoji: string; label: string }
> = {
  [ReactionType.THUMBS_UP]: { emoji: "👍", label: "Like" },
  [ReactionType.LOVE]: { emoji: "❤️", label: "Love" },
  [ReactionType.HAHA]: { emoji: "😂", label: "Haha" },
  [ReactionType.WOW]: { emoji: "😮", label: "Wow" },
  [ReactionType.ANGRY]: { emoji: "😠", label: "Angry" },
  [ReactionType.SAD]: { emoji: "😢", label: "Sad" },
};
