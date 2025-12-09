import React from "react";
import { Modal, Pressable, StyleSheet, useColorScheme } from "react-native";
import { TUser } from "@/types/user/types";
import ProfilePictureModalContent, {
  IProfileDisplayData,
} from "@/components/ProfilePictureModelContent";

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

export const MentionProfileModal: React.FC<MentionProfileModalProps> = ({
  visible,
  user,
  onClose,
  onMessagePress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!user) return null;

  const profileData: IProfileDisplayData = {
    name: `${user.firstName} ${user.lastName}`.trim(),
    signedImageUrl: user.signedImageUrl,
    secondaryText: user.email,
    isGroup: false,
  };

  const handleMessagePress = () => {
    onClose();
    onMessagePress?.(user);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className={`rounded-[28px] pt-8 pb-6 px-5 w-full max-w-xs ${
            isDark ? "bg-gray-900" : "bg-white"
          }`}
          style={styles.modalContainer}
        >
          <ProfilePictureModalContent
            profileData={profileData}
            onMessagePress={handleMessagePress}
            onCallPress={undefined}
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
});
