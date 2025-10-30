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

import { PLATFORM } from "@/constants/platformConstants";
import { CHAT_VIEW_PATH, CONVERSATION_DETAIL } from "@/constants/routes";
import { IConversation } from "@/types/chat/types";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { isSameDay } from "date-fns";
import { router } from "expo-router";
import { KeyboardEvent, useCallback } from "react";
import { ColorSchemeName, TextInputKeyPressEvent } from "react-native";

type KeyEvent = KeyboardEvent | TextInputKeyPressEvent;

const getDateOnly = (daysAgo: number = 0): Date => {
  const date = new Date();
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - daysAgo,
  );
};

const getLastMessageTime = (isoString: string): string => {
  if (!isoString) return "";

  const inputDate = new Date(isoString);
  if (isNaN(inputDate.getTime())) return "";

  const inputDateOnly = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
  );

  const today = getDateOnly(0);
  const yesterday = getDateOnly(1);

  // Check if it's today
  if (inputDateOnly.getTime() === today.getTime()) {
    return inputDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Check if it's yesterday
  if (inputDateOnly.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // Otherwise return the date
  return inputDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getNavigationTheme = (colorScheme: ColorSchemeName) => {
  return colorScheme === "dark" ? DarkTheme : DefaultTheme;
};

const getInitials = (name: string): string => {
  if (!name || typeof name !== "string") {
    return "";
  }

  return name
    .trim()
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("");
};

const handleConversationNavigation = (
  isWebAction: () => void,
  conversationId: number,
) => {
  if (PLATFORM.IS_WEB) {
    isWebAction();
  } else {
    router.push({
      pathname: CONVERSATION_DETAIL,
      params: { id: conversationId },
    });
  }
};

// const handleChatSearchNavigation = (webAction: () => void, ) => {

// }

const handleChatPress = (
  setSelectedConversation: (conversation: IConversation | null) => void,
) => {
  const handleChatPress = (item: IConversation) => {
    if (!PLATFORM.IS_WEB) {
      router.push({
        pathname: CHAT_VIEW_PATH,
        params: {
          conversationId: item.id,
          conversationName: item.name,
        },
      });
    } else {
      setSelectedConversation(item);
    }
  };

  return handleChatPress;
};

const formatRelativeTime = (iso?: string): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";

  const today = getDateOnly(0);
  const yesterday = getDateOnly(1);

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isSameDay(date, today)) return timeStr;
  if (isSameDay(date, yesterday)) return `Yesterday, ${timeStr}`;

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const useEnterSubmit = (onSubmit: () => void) => {
  return useCallback(
    (e: KeyEvent) => {
      const key =
        (e as TextInputKeyPressEvent).nativeEvent?.key ??
        (e as KeyboardEvent).key;

      const shiftPressed = (e as KeyboardEvent).shiftKey ?? false;

      if (key === "Enter" && !shiftPressed) {
        if ("preventDefault" in e) {
          e.preventDefault?.();
        }
        onSubmit();
      }
    },
    [onSubmit],
  );
};

const getUserDisplayName = (firstName: string, lastName: string) => {
  return [firstName, lastName].filter(Boolean).join(" ") || "Unknown User";
};

const getAPIErrorMsg = (error: any) =>
  (error?.response?.data?.message as string) || (error?.message as string);

const getAdjustedPosition = (
  position: { x: number; y: number },
  screenWidth: number,
  screenHeight: number,
  modalWidth: number,
  modalHeight: number,
) => ({
  x: Math.max(12, Math.min(position.x, screenWidth - modalWidth - 12)),
  y:
    position.y + modalHeight > screenHeight - 30
      ? position.y - modalHeight - 12
      : position.y,
});

export {
  getLastMessageTime,
  getNavigationTheme,
  getInitials,
  handleConversationNavigation,
  handleChatPress,
  formatRelativeTime,
  useEnterSubmit,
  getUserDisplayName,
  getAPIErrorMsg,
  getAdjustedPosition,
};
