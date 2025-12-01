import React from "react";
import { Modal, Pressable, StyleSheet, View, Text, useColorScheme } from "react-native";
import { Image } from "expo-image";
import { Feather, Ionicons } from "@expo/vector-icons";
import { TUser } from "@/types/user/types";
import InitialsAvatar from "@/components/InitialsAvatar";

const COLORS = {
  modalBackdrop: "rgba(9, 15, 29, 0.8)",
  shadow: "#000000",
};

interface MentionProfileModalProps {
  visible: boolean;
  user: TUser | null;
  onClose: () => void;
  onMessagePress?: (user: TUser) => void;
}

const RichMentionProfileCard: React.FC<{
  user: TUser;
  onMessagePress?: () => void;
}> = ({ user, onMessagePress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const textColor = isDark ? "#F9FAFB" : "#111827";
  const secondaryTextColor = isDark ? "#9CA3AF" : "#6B7280";
  const buttonBg = isDark ? "#374151" : "#E5E7EB";
  const buttonText = isDark ? "#F9FAFB" : "#374151";

  const userName = `${user.firstName} ${user.lastName}`.trim() || user.username || "Unknown";
  const userSecondaryText = user.email;

  return (
    <View className="items-center w-full">
      <View className="items-center justify-center mb-3 relative">
        <View className={`rounded-full shadow-sm overflow-hidden`}>
          {user.signedImageUrl ? (
            <View className="w-28 h-28">
              <Image
                source={{ uri: user.signedImageUrl }}
                className="w-full h-full"
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            </View>
          ) : (
            <InitialsAvatar imageUrl={user.signedImageUrl} size="lg" name={userName} />
          )}
        </View>
      </View>
      <View className="items-center mb-6">
        <Text
          className="text-xl font-bold mb-1 text-center"
          style={{ color: textColor }}
          numberOfLines={1}
        >
          {userName}
        </Text>
        {userSecondaryText && (
          <Text
            className="text-sm font-medium text-center"
            style={{ color: secondaryTextColor }}
            numberOfLines={1}
          >
            {userSecondaryText}
          </Text>
        )}
      </View>

      <View className="flex-row items-center w-full justify-center gap-2">
        <Pressable
          onPress={onMessagePress}
          className="flex-1 flex-row items-center justify-center py-3 px-4 rounded-full ml-2"
          style={{ backgroundColor: buttonBg }}
        >
          <Feather name="message-circle" size={18} color={buttonText} style={styles.icon} />
          <Text className="font-semibold text-sm" style={{ color: buttonText }}>
            Message
          </Text>
        </Pressable>

        <Pressable
          className="w-12 h-12 items-center justify-center rounded-full"
          style={{ backgroundColor: buttonBg }}
        >
          <Ionicons name="call-outline" size={20} color={buttonText} disabled />
        </Pressable>
      </View>
    </View>
  );
};

export const MentionProfileModal: React.FC<MentionProfileModalProps> = ({
  visible,
  user,
  onClose,
  onMessagePress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!user) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className={`rounded-[28px] pt-8 pb-6 px-5 w-full max-w-xs ${isDark ? "bg-gray-900" : "bg-white"}`}
          style={styles.modalContainer}
        >
          <RichMentionProfileCard
            user={user}
            onMessagePress={() => {
              onClose();
              onMessagePress?.(user);
            }}
          />
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
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },
  icon: {
    marginRight: 6,
  },
});
