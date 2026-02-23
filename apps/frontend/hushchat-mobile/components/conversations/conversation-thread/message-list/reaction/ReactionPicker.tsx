import React, { memo, useCallback, useMemo, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { REACTION_META } from "@/constants/reactions";
import classNames from "classnames";
import { ReactionType } from "@/types/chat/types";
import EmojiGlyph from "@/components/conversations/conversation-thread/message-list/reaction/EmojiGlyph";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { MotionView } from "@/motion/MotionView";
import { MotionConfig } from "@/motion/config";
import { PLATFORM } from "@/constants/platformConstants";

type ReactionPickerProps = {
  visible: boolean;
  reactedByCurrentUser?: string;
  onSelect: (type: ReactionType) => void;
  isCurrentUser: boolean;
  onRequestClose?: () => void;
};

const EMOJIS: ReactionType[] = [
  ReactionType.THUMBS_UP,
  ReactionType.LOVE,
  ReactionType.HAHA,
  ReactionType.WOW,
  ReactionType.SAD,
  ReactionType.ANGRY,
];

const ReactionPicker = memo(
  ({
    visible,
    reactedByCurrentUser,
    onSelect,
    isCurrentUser,
    onRequestClose,
  }: ReactionPickerProps) => {
    const rootRef = useRef<View | null>(null);
    useOutsideClick(rootRef, () => onRequestClose?.(), visible);

    const handleSelect = useCallback(
      (type: ReactionType) => {
        onSelect(type);
      },
      [onSelect]
    );

    const emojiButtons = useMemo(
      () =>
        EMOJIS.map((type) => {
          const isSelected = reactedByCurrentUser === type;
          return (
            <TouchableOpacity
              key={type}
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                handleSelect(type);
              }}
              className={classNames(
                "items-center justify-center px-1 rounded-full",
                "active:bg-gray-100 dark:active:bg-gray-700",
                "min-w-[36px] min-h-[36px] overflow-visible",
                {
                  "bg-primary-light/40 dark:bg-primary-dark/40 border border-primary-light dark:border-primary-dark scale-110 shadow-md":
                    isSelected,
                }
              )}
            >
              <View pointerEvents="none">
                <EmojiGlyph size={24}>{REACTION_META[type].emoji}</EmojiGlyph>
              </View>
            </TouchableOpacity>
          );
        }),
      [reactedByCurrentUser, handleSelect]
    );

    if (!visible) return null;

    const alignmentStyle = isCurrentUser ? styles.alignEnd : styles.alignStart;

    return (
      <View pointerEvents="box-none" style={[styles.overlay, alignmentStyle]}>
        <MotionView
          visible={visible}
          from={{ opacity: 0, scale: 0.8 }}
          to={{ opacity: 1, scale: 1 }}
          duration={{ enter: MotionConfig.duration.sm, exit: MotionConfig.duration.xs }}
          easing="decelerate"
          pointerEvents="auto"
          className="z-20"
        >
          <View
            ref={rootRef}
            {...(PLATFORM.IS_WEB
              ? {
                  onClick: (e: any) => e.stopPropagation(),
                  onTouchEnd: (e: any) => e.stopPropagation(),
                }
              : {})}
            className="flex-row w-fit p-1.5 items-center rounded-full shadow-lg bg-secondary-light dark:bg-secondary-dark border border-gray-200 dark:border-gray-600"
          >
            {emojiButtons}
          </View>
        </MotionView>
      </View>
    );
  }
);

ReactionPicker.displayName = "ReactionPicker";
export default ReactionPicker;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "flex-start",
  },
  alignEnd: {
    alignItems: "flex-end",
  },
  alignStart: {
    alignItems: "flex-start",
  },
});
