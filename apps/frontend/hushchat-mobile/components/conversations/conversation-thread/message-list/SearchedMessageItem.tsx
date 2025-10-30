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

import { AppText } from "@/components/AppText";
import { IConversation, IMessageView } from "@/types/chat/types";
import { getLastMessageTime, getUserDisplayName } from "@/utils/commonUtils";
import { TouchableOpacity, View } from "react-native";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";

interface SearchedMessageItemProps {
  message: IMessageView;
  searchQuery: string;
  onPressMessageItem?: (message: IMessageView) => void;
  isCurrentUser?: boolean;
}

interface SearchedConversationItemProps {
  conversation: IConversation;
  searchQuery: string;
  onPressConversationItem?: (conversation: IConversation) => void;
  isCurrentUser?: boolean;
}

interface SearchedItemProps {
  message?: IMessageView;
  conversation?: IConversation;
  onConversationItemPress?: (item: IMessageView | IConversation) => void;
  onMessageItemPress?: (item: IMessageView) => void;
  searchQuery: string;
  isCurrentUser?: boolean;
}

// Highlight search query in text
const highlightText = (text: string, query: string) => {
  if (!query || !text)
    return <AppText className="text-gray-600">{text || ""}</AppText>;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

  return (
    <AppText className="text-gray-600 dark:text-gray-500">
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <AppText key={index} className="bg-yellow-300 text-gray-900">
            {part}
          </AppText>
        ) : (
          <AppText key={index}>{part}</AppText>
        ),
      )}
    </AppText>
  );
};

const SearchedMessageItem = (props: SearchedMessageItemProps) => {
  const { message, onPressMessageItem, searchQuery, isCurrentUser } = props;
  return (
    <TouchableOpacity
      className="flex-row justify-between py-2.5 px-4 active:bg-gray-50 dark:active:bg-gray-800 rounded-lg"
      onPress={() => onPressMessageItem?.(message)}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
    >
      <View className="flex-1">
        <AppText className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
          {isCurrentUser
            ? "From: You"
            : `From: ${getUserDisplayName(message?.senderFirstName, message?.senderLastName)}`}
        </AppText>
        <AppText
          numberOfLines={2}
          ellipsizeMode="tail"
          className="text-base leading-5"
        >
          {highlightText(message?.messageText, searchQuery)}
        </AppText>
      </View>
      <AppText className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
        {getLastMessageTime(message?.createdAt)}
      </AppText>
    </TouchableOpacity>
  );
};

const SearchedConversationItem = (props: SearchedConversationItemProps) => {
  const { conversation, onPressConversationItem, searchQuery, isCurrentUser } =
    props;
  return (
    <TouchableOpacity
      className="flex-row justify-between py-2.5 px-4 active:bg-gray-50 dark:active:bg-gray-800 rounded-lg"
      onPress={() => onPressConversationItem?.(conversation)}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
    >
      <View className="flex-1">
        <AppText className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
          {conversation.name || "Conversation Name"}
        </AppText>
        <View className="flex-row items-center gap-1">
          <AppText className="text-sm text-text-primary-light dark:text-text-primary-dark">
            {isCurrentUser
              ? "You: "
              : `${getUserDisplayName(
                  conversation?.messages?.[0]?.senderFirstName,
                  conversation?.messages?.[0]?.senderLastName,
                )}: `}
          </AppText>
          <AppText
            numberOfLines={1}
            ellipsizeMode="tail"
            className="flex-1 text-base leading-5"
          >
            {highlightText(
              conversation?.messages?.[0]?.messageText,
              searchQuery,
            )}
          </AppText>
        </View>
      </View>
      <AppText className="text-gray-500 dark:text-text-secondary-dark text-sm">
        {getLastMessageTime(conversation?.messages?.[0]?.createdAt)}
      </AppText>
    </TouchableOpacity>
  );
};

export const SearchedItem: React.FC<SearchedItemProps> = ({
  message,
  conversation,
  searchQuery,
  onConversationItemPress,
  onMessageItemPress,
  isCurrentUser,
}) => {
  return (
    <>
      {message ? (
        <SearchedMessageItem
          message={message}
          searchQuery={searchQuery}
          onPressMessageItem={onMessageItemPress}
          isCurrentUser={isCurrentUser}
        />
      ) : (
        <SearchedConversationItem
          conversation={conversation ?? ({} as IConversation)}
          searchQuery={searchQuery}
          onPressConversationItem={onConversationItemPress}
          isCurrentUser={isCurrentUser}
        />
      )}
    </>
  );
};
