import React, { useEffect, useState } from "react";
import { Modal, Pressable, View, ActivityIndicator } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import InitialsAvatar from "@/components/InitialsAvatar";
import { AppText } from "@/components/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useUserProfileImageQuery } from "@/hooks/useUserProfileImageQuery";

type TProfileCardData = {
  name: string;
  imageUrl: string | null;
  username: string;
  isGroup?: boolean;
  userId?: number;
};

interface IProfileCardModalProps {
  visible: boolean;
  onClose: () => void;
  data: TProfileCardData;
  onMessagePress?: () => void;
  onCallPress?: () => void;
}

export const ProfileCardModal: React.FC<IProfileCardModalProps> = ({
  visible,
  onClose,
  data,
  onMessagePress,
  onCallPress,
}) => {
  const { isDark } = useAppTheme();
  const iconColor = isDark ? "#F9FAFB" : "#374151";

  const { data: userImageData, isLoading } = useUserProfileImageQuery(
    data.userId || 0,
    visible && !!data.userId
  );

  const [displayImageUrl, setDisplayImageUrl] = useState<string | null>(data.imageUrl);

  useEffect(() => {
    if (userImageData?.data?.signedImageUrl) {
      setDisplayImageUrl(userImageData.data.signedImageUrl);
    } else if (visible) {
      setDisplayImageUrl(data.imageUrl);
    }
  }, [userImageData, visible, data.imageUrl]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-center items-center p-5 bg-[rgba(9,15,29,0.8)]"
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="rounded-[28px] pt-8 pb-6 px-5 w-full max-w-xs items-center bg-white dark:bg-gray-900 elevation-24"
        >
          <View className="mb-6 relative">
            <InitialsAvatar imageUrl={displayImageUrl} size="lg" name={data.name} />
            {isLoading && (
              <View className="absolute inset-0 justify-center items-center bg-black/10 rounded-full">
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            )}
          </View>

          <View className="items-center mb-6 px-4">
            <AppText
              className="text-xl font-bold text-center text-text-primary-light dark:text-text-primary-dark mb-1"
              numberOfLines={1}
            >
              {data.name}
            </AppText>

            <AppText
              className="text-gray-500 dark:text-gray-400 text-base text-center mb-2"
              numberOfLines={1}
            >
              {data.username}
            </AppText>
          </View>

          {onMessagePress && (
            <View className="flex-row items-center w-full justify-center gap-2 px-4">
              {onMessagePress && (
                <Pressable
                  onPress={() => {
                    onClose();
                    onMessagePress();
                  }}
                  className="flex-1 flex-row items-center justify-center py-3 px-4 rounded-full bg-gray-200 dark:bg-gray-700"
                >
                  <Feather
                    name="message-circle"
                    size={18}
                    color={iconColor}
                    style={{ marginRight: 8 }}
                  />
                  <AppText className="font-semibold text-sm text-gray-700 dark:text-gray-50">
                    Message
                  </AppText>
                </Pressable>
              )}

              {onCallPress && (
                <Pressable
                  onPress={() => {
                    onClose();
                    onCallPress();
                  }}
                  className="w-12 h-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700"
                >
                  <Ionicons name="call-outline" size={20} color={iconColor} />
                </Pressable>
              )}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ProfileCardModal;
