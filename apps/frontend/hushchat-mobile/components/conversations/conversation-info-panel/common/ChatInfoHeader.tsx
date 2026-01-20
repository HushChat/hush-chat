import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DEFAULT_ACTIVE_OPACITY, DEFAULT_HIT_SLOP } from "@/constants/ui";
import { PLATFORM } from "@/constants/platformConstants";
import ChatInfoNameBar from "@/components/conversations/conversation-info-panel/common/ChatInfoNameBar";
import { useAppTheme } from "@/hooks/useAppTheme";
import { AppText } from "@/components/AppText";
import { getInitials } from "@/utils/commonUtils";

type ChatInfoHeaderProps = {
  title: string;
  onBack: () => void;
  showActions?: boolean;
  onPressChat?: () => void;
  onPressCall?: () => void;
  imageUrl?: string | undefined | null;
  onPressSearch: () => void;
};

export default function ChatInfoHeader({
  title,
  onBack,
  showActions,
  onPressChat,
  onPressCall,
  imageUrl,
  onPressSearch,
}: ChatInfoHeaderProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  return (
    <View>
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: insets.top,
            height: 320 + insets.top,
          },
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.headerImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View className="flex-1 justify-center items-center bg-primary-light dark:bg-primary-dark">
            <AppText className={`text-[100px] text-center text-white`}>
              {getInitials(title)}
            </AppText>
          </View>
        )}

        <TouchableOpacity
          onPress={onBack}
          className={classNames(
            "absolute m-3 z-2 p-2 rounded-full",
            PLATFORM.IS_WEB && "hover:bg-gray-900/20",
            !PLATFORM.IS_WEB && "active:bg-gray-900/20"
          )}
          hitSlop={DEFAULT_HIT_SLOP}
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
        >
          <Ionicons
            name={`${PLATFORM.IS_WEB ? "close" : "arrow-back"}`}
            size={PLATFORM.IS_WEB ? 26 : 24}
            color={isDark ? "#ffffff" : "#111827"}
          />
        </TouchableOpacity>
      </View>
      <ChatInfoNameBar
        title={title}
        showActions={!!showActions}
        onPressChat={onPressChat}
        onPressCall={onPressCall}
        onPressSearch={onPressSearch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative",
  },
  headerImage: {
    height: 320,
  },
});
