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
import { MaterialIcons } from "@expo/vector-icons";
import type { IOption } from "@/types/chat/types";

/**
 * Menu options for the ConversationInputBar
 * Keep UI config separate from the input component logic.
 */
export const getConversationMenuOptions = (
  fileInputRef: React.RefObject<HTMLInputElement | null>,
): IOption[] => [
  {
    id: 1,
    name: "Photos & Documents",
    iconComponent: (props: { size: number }) => (
      <MaterialIcons name="photo-library" size={props.size} color="#3B82F6" />
    ),
    action: () => {
      fileInputRef.current?.click();
    },
  },
];
