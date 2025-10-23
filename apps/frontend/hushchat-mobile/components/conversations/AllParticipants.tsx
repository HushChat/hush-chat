import React, { useMemo, useEffect } from 'react';
import { View, TouchableOpacity, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { ParticipantRow } from '@/components/conversations/ParticipantsRow';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { useConversationParticipantQuery } from '@/query/useConversationParticipantQuery';
import { ConversationParticipant } from '@/types/chat/types';
import { MODAL_BUTTON_VARIANTS, MODAL_TYPES } from '@/components/Modal';
import { useModalContext } from '@/context/modal-context';
import { ToastUtils } from '@/utils/toastUtils';
import { useGroupConversationInfoQuery } from '@/query/useGroupConversationInfoQuery';
import {
  useRemoveConversationParticipantMutation,
  useUpdateConversationParticipantRoleMutation,
} from '@/query/delete/queries';
import { AppText } from '@/components/AppText';

interface AllParticipantsProps {
  conversationId: number;
  visible: boolean;
  onClose: () => void;
  panelWidth?: number;
}

export const AllParticipants = ({ conversationId, visible, onClose }: AllParticipantsProps) => {
  const screenWidth = Dimensions.get('window').width;

  const translateX = useSharedValue(screenWidth);
  const opacity = useSharedValue(0);

  const { pages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } =
    useConversationParticipantQuery(conversationId);

  const allParticipants = useMemo(
    () => pages?.pages?.flatMap((page) => (page.content as ConversationParticipant[]) || []) || [],
    [pages],
  );

  const { openModal, closeModal } = useModalContext();

  const { conversationInfo } = useGroupConversationInfoQuery(conversationId);

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withDelay(
        40,
        withTiming(1, { duration: 160, easing: Easing.out(Easing.quad) }),
      );
    } else {
      translateX.value = withTiming(screenWidth, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, {
        duration: 120,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [visible, screenWidth, translateX, opacity]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const removeParticipant = (participantId: number) => {
    openModal({
      type: MODAL_TYPES.confirm,
      title: 'Remove Participant',
      description: 'Are you sure you want to remove this participant from the conversation?',
      buttons: [
        { text: 'Cancel', onPress: closeModal },
        {
          text: 'Remove',
          onPress: () =>
            handleRemoveParticipant.mutate({
              conversationId,
              participantId,
            }),
          variant: MODAL_BUTTON_VARIANTS.destructive,
        },
      ],
      icon: 'exit-outline',
    });
  };

  const handleRemoveParticipant = useRemoveConversationParticipantMutation(
    {
      conversationId,
    },
    async () => {
      closeModal();
      ToastUtils.success('Participant removed successfully!');
      await refetch();
    },
    (error) => {
      closeModal();
      ToastUtils.error((error as string) || 'Failed to remove participant.');
    },
  );

  const updateConversationParticipantRole = (participantId: number, makeAdmin: boolean) => {
    openModal({
      type: MODAL_TYPES.confirm,
      title: 'Update Participant Role',
      description: "Are you sure you want to update this participant's role?",
      buttons: [
        { text: 'Cancel', onPress: closeModal },
        {
          text: 'Update',
          onPress: () =>
            handleUpdateConversationParticipantRole.mutate({
              conversationId,
              participantId,
              makeAdmin,
            }),
          variant: MODAL_BUTTON_VARIANTS.primary,
        },
      ],
      icon: 'shield-checkmark-outline',
    });
  };

  const handleUpdateConversationParticipantRole = useUpdateConversationParticipantRoleMutation(
    {
      conversationId,
    },
    async () => {
      closeModal();
      ToastUtils.success('Participant role updated successfully!');
      await refetch();
    },
    (error) => {
      closeModal();
      ToastUtils.error((error as string) || 'Failed to update participant role.');
    },
  );

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        {
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
        containerStyle,
      ]}
      className="dark:bg-gray-900"
    >
      <View className="flex-row justify-between items-center px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark">
        <AppText className="text-xl font-semibold text-gray-900 dark:text-white">
          All Participants
        </AppText>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="close-outline" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={allParticipants}
        renderItem={({ item }) => (
          <ParticipantRow
            participant={item}
            showMenu={conversationInfo?.admin}
            onRemove={removeParticipant}
            onToggleRole={updateConversationParticipantRole}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading || isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator
        className="flex-1 bg-background-light dark:bg-background-dark custom-scrollbar"
      />
    </Animated.View>
  );
};
