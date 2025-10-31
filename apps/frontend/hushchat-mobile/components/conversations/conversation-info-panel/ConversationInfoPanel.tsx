import React, { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAnimatedEntrance } from "@/hooks/useAnimatedEntrance";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import ErrorView from "@/components/ErrorView";
import { Images } from "@/assets/images";
import { useConversationByIdQuery } from "@/query/useConversationByIdQuery";
import OneToOneChatInfo from "@/components/conversations/conversation-info-panel/OneToOneChatInfo";
import GroupChatInfo from "@/components/conversations/conversation-info-panel/GroupChatInfo";

export interface ChatInfoScreenProps {
  conversationId: number;
  onClose?: () => void;
  isWebView?: boolean;
  setSelectedConversation: (conversation: null) => void;
}

export default function ConversationInfoPanel({
  conversationId,
  onClose,
  setSelectedConversation,
}: ChatInfoScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const router = useRouter();
  const { opacity, translateY, show } = useAnimatedEntrance();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const {
    conversationAPIResponse,
    conversationAPILoading,
    conversationAPIError,
    refetchConversation,
  } = useConversationByIdQuery(conversationId);

  useEffect(() => {
    void show();
  }, [show]);

  const goBack = () => (onClose ? onClose() : router.back());

  if (conversationAPILoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: colors.background,
          paddingTop: insets.top + 12,
        }}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600 dark:text-text-secondary-dark">
          Loading conversation...
        </Text>
      </View>
    );
  }

  if (conversationAPIError || !conversationAPIResponse) {
    return (
      <ErrorView
        title="Conversation"
        message={conversationAPIError?.message || "Unable to load conversation details"}
        onBack={goBack}
        onRetry={refetchConversation}
        imageSource={Images.NoConversationFound}
      />
    );
  }

  const { isGroup } = conversationAPIResponse;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark border-l border-gray-200 dark:border-gray-800">
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {isGroup ? (
          <GroupChatInfo
            conversation={conversationAPIResponse}
            onBack={goBack}
            setSelectedConversation={setSelectedConversation}
          />
        ) : (
          <OneToOneChatInfo
            conversation={conversationAPIResponse}
            onBack={goBack}
            setSelectedConversation={setSelectedConversation}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}
