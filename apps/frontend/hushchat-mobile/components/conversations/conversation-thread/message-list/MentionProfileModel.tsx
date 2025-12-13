import React from "react";
import { TUser } from "@/types/user/types";
import ProfileCardModal from "@/components/ProfileCardModal";

interface MentionProfileModalProps {
  visible: boolean;
  user: TUser | null;
  onClose: () => void;
  onMessagePress?: (user: TUser) => void;
  onCallPress?: (user: TUser) => void;
}

export const MentionProfileModal: React.FC<MentionProfileModalProps> = ({
  visible,
  user,
  onClose,
  onMessagePress,
  onCallPress,
}) => {
  if (!user) return null;

  return (
    <ProfileCardModal
      visible={visible}
      onClose={onClose}
      data={{
        name: `${user.firstName} ${user.lastName}`.trim(),
        imageUrl: user.signedImageUrl,
        secondaryText: user.username,
        isGroup: false,
      }}
      onMessagePress={onMessagePress ? () => onMessagePress(user) : undefined}
      onCallPress={onCallPress ? () => onCallPress(user) : undefined}
      showCallButton={true}
    />
  );
};
