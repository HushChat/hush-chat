import React, { useCallback } from "react";
import { TUser } from "@/types/user/types";
import ProfileCardModal from "@/components/ProfileCardModal";

interface IMentionProfileModalProps {
  visible: boolean;
  user: TUser | null;
  onClose: () => void;
  onMessagePress: (user: TUser) => void;
  onCallPress?: (user: TUser) => void;
}

export const MentionProfileModal: React.FC<IMentionProfileModalProps> = ({
  visible,
  user,
  onClose,
  onMessagePress,
  onCallPress,
}) => {
  const handleMessagePress = useCallback(() => {
    if (user) {
      onMessagePress(user);
    }
  }, [onMessagePress, user]);

  const handleCallPress = useCallback(() => {
    if (user && onCallPress) {
      onCallPress(user);
    }
  }, [onCallPress, user]);

  if (!user) return null;

  return (
    <ProfileCardModal
      visible={visible}
      onClose={onClose}
      data={{
        name: `${user.firstName} ${user.lastName}`.trim(),
        imageUrl: user.signedImageUrl,
        username: user.username,
        isGroup: false,
        userId: user.id, // ← ADD THIS LINE
      }}
      onMessagePress={handleMessagePress}
      onCallPress={onCallPress ? handleCallPress : undefined}
    />
  );
};
