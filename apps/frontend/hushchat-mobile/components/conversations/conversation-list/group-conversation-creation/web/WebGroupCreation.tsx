import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { TUser } from '@/types/user/types';
import { UserMultiSelectList } from '@/components/UserMultiSelect';
import { DEFAULT_ACTIVE_OPACITY } from '@/constants/ui';
import GroupConfigurationForm from '@/components/conversations/conversation-list/group-conversation-creation/GroupConfigurationForm';
import { scheduleOnRN } from 'react-native-worklets';
import { IConversation } from '@/types/chat/types';

type TWebGroupCreationOverlay = {
  visible: boolean;
  width: number;
  onClose: () => void;
  onCreate?: (conversationId: number) => void;
  setSelectedConversation: (conversation: IConversation | null) => void;
};

export const WebGroupCreation = ({
  visible,
  width,
  onClose,
  onCreate,
  setSelectedConversation,
}: TWebGroupCreationOverlay) => {
  const tx = useSharedValue(width);
  const op = useSharedValue(0);
  const stepX = useSharedValue(0);

  const [selectedUsers, setSelectedUsers] = useState<TUser[]>([]);
  const [showConfigurationForm, setShowConfigurationForm] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedUsers([]);
      setShowConfigurationForm(false);

      stepX.value = 0;
      tx.value = width;
      op.value = 0;

      tx.value = withTiming(0, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });
      op.value = withTiming(1, {
        duration: 160,
        easing: Easing.out(Easing.quad),
      });
    } else {
      tx.value = withTiming(width, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });
      op.value = withTiming(0, {
        duration: 120,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [op, stepX, tx, visible, width]);

  const handleNext = useCallback(() => {
    if (selectedUsers.length === 0) return;

    setShowConfigurationForm(true);
    stepX.value = withTiming(-width, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [selectedUsers.length, stepX, width]);

  const handleBack = useCallback(() => {
    if (showConfigurationForm) {
      stepX.value = withTiming(
        0,
        {
          duration: 240,
          easing: Easing.out(Easing.cubic),
        },
        () => {
          scheduleOnRN(() => setShowConfigurationForm(false));
        },
      );
    } else {
      onClose();
    }
  }, [showConfigurationForm, stepX, onClose]);

  const handleGroupCreated = useCallback(
    (conversationId: number) => {
      onCreate?.(conversationId);
      onClose();
    },
    [onCreate, onClose],
  );

  const participantUserIds = selectedUsers.map((u) => u.id);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
    opacity: op.value,
  }));

  const stepsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: stepX.value }],
  }));

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width,
          backgroundColor: '#FFFFFF',
        },
        containerStyle,
      ]}
      className="dark:bg-gray-900"
    >
      <View className="flex-row items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleBack} className="mr-3">
            <Ionicons name="arrow-back" size={22} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900 dark:text-white">
            {showConfigurationForm ? 'Group Details' : 'New group'}
          </Text>
        </View>

        {!showConfigurationForm && (
          <TouchableOpacity
            onPress={handleNext}
            disabled={selectedUsers.length === 0}
            className={`px-3 py-2 rounded-lg ${
              selectedUsers.length > 0
                ? 'bg-primary-light dark:bg-primary-dark'
                : 'bg-gray-300 dark:bg-gray-700'
            }`}
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
          >
            <Text
              className={`text-xs font-medium leading-none ${
                selectedUsers.length > 0 ? 'text-white' : 'text-gray-500 dark:text-gray-300'
              }`}
            >
              Continue
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1 bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 overflow-hidden">
        <Animated.View
          style={[
            {
              width: width * 2,
              height: '100%',
              flexDirection: 'row',
            },
            stepsStyle,
          ]}
        >
          <View style={{ width, height: '100%' }}>
            <UserMultiSelectList
              selectedUsers={selectedUsers}
              onChange={setSelectedUsers}
              searchPlaceholder="Add participants…"
            />
          </View>

          <View style={{ width, height: '100%' }}>
            {showConfigurationForm ? (
              <GroupConfigurationForm
                participantUserIds={participantUserIds}
                onSuccess={handleGroupCreated}
                submitLabel="Create group"
                setSelectedConversation={setSelectedConversation}
              />
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
};
