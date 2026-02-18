import React, { useCallback, useRef, useState } from "react";
import { ConversationParticipant } from "@/types/chat/types";
import { View, Pressable, GestureResponderEvent } from "react-native";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import { PLATFORM } from "@/constants/platformConstants";
import ChevronButton from "@/components/ChevronButton";
import classNames from "classnames";
import WebParticipantContextMenu from "@/components/conversations/WebParticipantContextMenu";
import * as Haptics from "expo-haptics";
import MobileParticipantContextMenu from "@/components/conversations/conversation-thread/MobileParticipantContextMenu";
import { useUserStore } from "@/store/user/useUserStore";
import { AppText } from "@/components/AppText";

export const ParticipantRow = ({
  participant,
  showMenu = false,
  onRemove,
  onToggleRole,
  onAvatarPress,
}: {
  participant: ConversationParticipant;
  showMenu?: boolean;
  onRemove?: (participantId: number) => void;
  onToggleRole?: (participantId: number, isAdmin: boolean) => void;
  onAvatarPress?: (participant: ConversationParticipant) => void;
}) => {
  const chevronButtonRef = useRef<View>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showMobileOptions, setShowMobileOptions] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const isCurrentUser = Number(useUserStore.getState().user.id) === participant.user.id;

  const handleOptionsPress = useCallback((e: GestureResponderEvent) => {
    e.stopPropagation();
    if (chevronButtonRef.current) {
      chevronButtonRef.current.measure(
        (fx: number, fy: number, width: number, height: number, px: number, py: number) => {
          setMenuPosition({
            x: px,
            y: py + height,
          });
          setShowOptions(true);
        }
      );
    }
  }, []);

  const handleLongPress = useCallback(() => {
    if (!showMenu) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMobileOptions(true);
  }, [showMenu]);

  const handleOptionsClose = useCallback(() => {
    setShowOptions(false);
  }, []);

  const handleMobileOptionsClose = useCallback(() => {
    setShowMobileOptions(false);
  }, []);

  return (
    <>
      <Pressable
        className={classNames(
          "group flex-row items-center px-6 py-4 active:bg-gray-100 dark:active:bg-gray-800",
          PLATFORM.IS_WEB &&
            showMenu &&
            "mx-1 rounded-2xl hover:bg-secondary-light dark:hover:bg-secondary-dark"
        )}
        onLongPress={handleLongPress}
      >
        <Pressable onPress={() => onAvatarPress?.(participant)} disabled={!onAvatarPress}>
          <InitialsAvatar
            name={`${participant.user.firstName} ${participant.user.lastName}`}
            size={AvatarSize.medium}
            imageUrl={participant.user.signedImageUrl || null}
          />
        </Pressable>
        <View className="flex-1 ml-3">
          <AppText className="text-base font-medium text-gray-900 dark:text-white">
            {`${participant.user.firstName} ${participant.user.lastName}`}
          </AppText>
          <AppText className="text-sm text-gray-500 dark:text-gray-400">
            {participant.user.email}
          </AppText>
        </View>
        {PLATFORM.IS_WEB && showMenu && (
          <ChevronButton
            chevronButtonRef={chevronButtonRef}
            handleOptionsPress={handleOptionsPress}
          />
        )}
      </Pressable>
      {showMenu && onRemove && onToggleRole && (
        <WebParticipantContextMenu
          visible={showOptions}
          position={menuPosition}
          onClose={handleOptionsClose}
          participant={participant}
          isCurrentUser={isCurrentUser}
          handleToggleAdmin={onToggleRole}
          handleRemoveParticipant={onRemove}
        />
      )}
      {!PLATFORM.IS_WEB && showMenu && onRemove && onToggleRole && (
        <MobileParticipantContextMenu
          visible={showMobileOptions}
          onClose={handleMobileOptionsClose}
          participant={participant}
          isCurrentUser={isCurrentUser}
          handleToggleAdmin={onToggleRole}
          handleRemoveParticipant={onRemove}
        />
      )}
    </>
  );
};
