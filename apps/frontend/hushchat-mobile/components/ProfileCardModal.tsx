import React from "react";
import { Modal, Pressable, View, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import InitialsAvatar from "@/components/InitialsAvatar";
import { AppText } from "@/components/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

type TProfileCardData = {
  name: string;
  imageUrl: string | null;
  username: string;
  isGroup?: boolean;
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-center items-center p-5"
        style={cardStyles.backdrop}
        onPress={onClose}
      >
        <Animated.View
          entering={FadeIn.duration(200).springify().damping(14)}
          exiting={FadeOut.duration(150)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="rounded-3xl pt-8 pb-6 px-5 w-full max-w-xs items-center bg-surface-light dark:bg-surface-dark"
            style={cardStyles.card}
          >
            <View className="mb-6">
              <InitialsAvatar imageUrl={data.imageUrl} size="lg" name={data.name} />
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
                <Pressable
                  onPress={() => {
                    onClose();
                    onMessagePress();
                  }}
                  className="flex-1 flex-row items-center justify-center py-3 px-4 rounded-full bg-primary-light/10 dark:bg-primary-dark/20"
                >
                  <Feather
                    name="message-circle"
                    size={18}
                    color={isDark ? "#a78bfa" : "#6B4EFF"}
                    style={{ marginRight: 8 }}
                  />
                  <AppText className="font-semibold text-sm text-primary-light dark:text-primary-dark">
                    Message
                  </AppText>
                </Pressable>

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
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default ProfileCardModal;

const cardStyles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(9, 15, 29, 0.8)",
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
});
