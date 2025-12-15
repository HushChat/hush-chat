import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons, Feather } from "@expo/vector-icons";
import InitialsAvatar from "@/components/InitialsAvatar";
import { AppText } from "@/components/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

const COLORS = {
  modalBackdrop: "rgba(9, 15, 29, 0.8)",
  shadow: "#000000",
};

type TProfileCardData = {
  name: string;
  imageUrl: string | null;
  secondaryText: string;
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
  const isDark = useAppTheme();

  const buttonBg = isDark ? "#374151" : "#E5E7EB";
  const buttonText = isDark ? "#F9FAFB" : "#374151";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className={`rounded-[28px] pt-8 pb-6 px-5 w-full max-w-xs items-center ${
            isDark ? "bg-gray-900" : "bg-white"
          }`}
          style={styles.modalContainer}
        >
          {data.imageUrl ? (
            <View className="w-28 h-28 rounded-full overflow-hidden mb-6 shadow-sm">
              <Image
                source={{ uri: data.imageUrl }}
                className="w-full h-full"
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            </View>
          ) : (
            <View className="mb-6">
              <InitialsAvatar imageUrl={data.imageUrl} size="lg" name={data.name} />
            </View>
          )}

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
              {data.secondaryText}
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
                  className="flex-1 flex-row items-center justify-center py-3 px-4 rounded-full"
                  style={{ backgroundColor: buttonBg }}
                >
                  <Feather
                    name="message-circle"
                    size={18}
                    color={buttonText}
                    style={{ marginRight: 8 }}
                  />
                  <AppText className="font-semibold text-sm" style={{ color: buttonText }}>
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
                  className="w-12 h-12 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: buttonBg,
                  }}
                >
                  <Ionicons name="call-outline" size={20} color={buttonText} />
                </Pressable>
              )}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.modalBackdrop,
    padding: 20,
  },
  modalContainer: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },
});

export default ProfileCardModal;
