import React, { forwardRef } from "react";
import { View } from "react-native";
import PrimaryCircularButton from "@/components/conversations/conversation-thread/composer/PrimaryCircularButton";

interface IAttachmentButtonProps {
  disabled?: boolean;
  toggled?: boolean;
  onPress: () => void;
}

export const AttachmentButton = forwardRef<View, IAttachmentButtonProps>(
  ({ disabled = false, toggled = false, onPress }, ref) => {
    return (
      <View ref={ref} className="flex-end">
        <PrimaryCircularButton
          disabled={disabled}
          iconSize={20}
          onPress={onPress}
          toggled={toggled}
        />
      </View>
    );
  }
);

AttachmentButton.displayName = "AttachmentButton";
