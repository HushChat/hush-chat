import { useMemo } from "react";
import { View } from "react-native";
import { AppText } from "@/components/AppText";

const MORE_THAN_99_MESSAGES_TEXT = "99+";
export const UnreadBadge = ({ count }: { count: number }) => {
  const display = useMemo(() => (count > 99 ? MORE_THAN_99_MESSAGES_TEXT : String(count)), [count]);

  return (
    <View
      className="bg-blue-500 dark:bg-blue-600 rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center ml-2"
      accessibilityRole="text"
      accessibilityLabel={`Unread messages: ${display}`}
      importantForAccessibility="yes"
    >
      <AppText className="text-xs font-semibold text-white" numberOfLines={1}>
        {display}
      </AppText>
    </View>
  );
};
