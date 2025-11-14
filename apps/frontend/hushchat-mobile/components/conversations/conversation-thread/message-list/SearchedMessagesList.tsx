import { SectionList, View, StyleSheet } from "react-native";
import { SearchedItem } from "@/components/conversations/conversation-thread/message-list/SearchedMessageItem";
import { IMessageView } from "@/types/chat/types";
import { useUserStore } from "@/store/user/useUserStore";
import { AppText } from "@/components/AppText";

interface SearchResultsListProps {
  messages: IMessageView[];
  searchQuery: string;
  onMessagePress?: (message: IMessageView) => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListFooterComponent?: React.ReactElement | null;
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <View className="bg-gray-100 dark:bg-gray-900 px-4 py-1.5">
    <AppText className="text-text-secondary-light dark:text-text-secondary-dark font-medium">
      {title}
    </AppText>
  </View>
);

const groupMessagesByDate = (messages: IMessageView[]) => {
  const grouped: { [key: string]: IMessageView[] } = {};

  messages.forEach((message) => {
    const date = new Date(message.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey: string;

    // Determine the date label
    if (date.toDateString() === today.toDateString()) {
      dateKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Yesterday";
    } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      // Within last week - show day name
      dateKey = date.toLocaleDateString("en-US", { weekday: "long" });
    } else {
      // Older - show date
      dateKey = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(message);
  });

  // Convert to sections array
  return Object.entries(grouped).map(([title, data]) => ({
    title,
    data,
  }));
};

export const SearchedMessagesList: React.FC<SearchResultsListProps> = ({
  messages,
  searchQuery,
  onMessagePress,
  onEndReached,
  onEndReachedThreshold = 0.3,
  ListFooterComponent,
}) => {
  const { user } = useUserStore();
  const currentUserId = user?.id;
  const sections = groupMessagesByDate(messages);

  if (messages.length === 0) {
    return null; // Parent component should handle empty state
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }: { item: IMessageView }) => {
        const isCurrentUser = Number(currentUserId) === item.senderId;
        return (
          <View className="py-1">
            <SearchedItem
              message={item}
              searchQuery={searchQuery}
              onMessageItemPress={onMessagePress}
              isCurrentUser={isCurrentUser}
            />
          </View>
        );
      }}
      renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
      className="bg-background-light dark:bg-background-dark"
      stickySectionHeadersEnabled={true}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={ListFooterComponent}
      ItemSeparatorComponent={() => (
        <View className="bg-gray-200 dark:bg-gray-900" style={styles.separator} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  separator: {
    width: "100%",
    height: 1,
  },
});
