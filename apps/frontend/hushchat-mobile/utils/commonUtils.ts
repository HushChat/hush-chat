import { PLATFORM } from "@/constants/platformConstants";
import { CHAT_VIEW_PATH, CONVERSATION_DETAIL } from "@/constants/routes";
import { DeviceType, IConversation } from "@/types/chat/types";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { format, isSameDay } from "date-fns";
import { Href, router } from "expo-router";
import { KeyboardEvent, useCallback } from "react";
import { ColorSchemeName, TextInputKeyPressEvent } from "react-native";

export type KeyEvent = KeyboardEvent | TextInputKeyPressEvent;

const getDateOnly = (daysAgo: number = 0): Date => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysAgo);
};

// input - iso string
// output - dec 5, 2025 11.00 AM
const formatDateTime = (isoString: string): string => {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  return format(date, "MMM d, yyyy h.mm a");
};

const getLastMessageTime = (isoString: string): string => {
  if (!isoString) return "";

  const inputDate = new Date(isoString);
  if (isNaN(inputDate.getTime())) return "";

  const inputDateOnly = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate()
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
    .slice(0, 2)
    .join("");
};

/**
 * Navigates back if a valid history entry exists.
 * Otherwise, performs a fallback navigation to a safe screen.
 */
const navigateBackOrFallback = (fallbackPath: Href) => {
  const hasHistory = typeof window !== "undefined";

  if (hasHistory) {
    router.back();
  } else {
    router.replace(fallbackPath);
  }
};

/**
 * Determines if the UI should behave as mobile (native or web-mobile)
 */
const shouldUseMobileUI = (isMobileLayout: boolean) => {
  return !PLATFORM.IS_WEB || isMobileLayout;
};

const handleConversationNavigation = (
  isWebAction: () => void,
  conversationId: number,
  isMobileLayout: boolean
) => {
  if (!shouldUseMobileUI(isMobileLayout)) {
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

const handleChatPress = (setSelectedConversation: (conversation: IConversation | null) => void) => {
  return (item: IConversation) => {
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
      const key = (e as TextInputKeyPressEvent).nativeEvent?.key ?? (e as KeyboardEvent).key;

      const shiftPressed = (e as KeyboardEvent).shiftKey ?? false;

      if (key === "Enter" && !shiftPressed) {
        if ("preventDefault" in e) {
          e.preventDefault?.();
        }
        onSubmit();
      }
    },
    [onSubmit]
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
  modalHeight: number
) => ({
  x: Math.max(12, Math.min(position.x, screenWidth - modalWidth - 12)),
  y: position.y + modalHeight > screenHeight - 30 ? position.y - modalHeight - 12 : position.y,
});

const getPaginationConfig = <T extends { id: any }>() => {
  return {
    getId: (m: T) => m?.id,
    getPageItems: (p: { content: T[] }) => p?.content,
    setPageItems: (p: { content: T[] }, items: T[]) => ({ ...p, content: items }),
  };
};

const capitalizeFirstLetter = (word: string): string => {
  if (!word) return "";

  const trimmed = word.trim();
  if (!trimmed) return "";

  return trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase();
};

const getDeviceType = (): DeviceType => {
  if (PLATFORM.IS_WEB) return DeviceType.WEB;
  return DeviceType.MOBILE;
};

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
  getPaginationConfig,
  shouldUseMobileUI,
  navigateBackOrFallback,
  capitalizeFirstLetter,
  getDeviceType,
  formatDateTime,
};
