/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { REACTION_META } from "@/constants/reactions";
import classNames from "classnames";
import { ReactionType } from "@/types/chat/types";
import EmojiGlyph from "@/components/conversations/conversation-thread/message-list/reaction/EmojiGlyph";
import { useOutsideClick } from "@/hooks/useOutsideClick";

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

    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);

    useEffect(() => {
      if (visible) {
        scale.value = withTiming(1, {
          duration: 150,
          easing: Easing.out(Easing.quad),
        });
        opacity.value = withTiming(1, {
          duration: 120,
          easing: Easing.out(Easing.quad),
        });
      } else {
        scale.value = 0.8;
        opacity.value = 0;
      }
    }, [opacity, scale, visible]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    const handleSelect = useCallback(
      (type: ReactionType) => {
        onSelect(type);
      },
      [onSelect],
    );

    const emojiButtons = useMemo(
      () =>
        EMOJIS.map((type) => {
          const isSelected = reactedByCurrentUser === type;
          return (
            <Pressable
              key={type}
              onPress={() => handleSelect(type)}
              className={classNames(
                "items-center justify-center px-1 rounded-full",
                "active:bg-gray-100 dark:active:bg-gray-700",
                "min-w-[36px] min-h-[36px] overflow-visible",
                {
                  "bg-primary-light/40 dark:bg-primary-dark/40 border border-primary-light dark:border-primary-dark scale-110 shadow-md":
                    isSelected,
                },
              )}
            >
              <EmojiGlyph size={24}>{REACTION_META[type].emoji}</EmojiGlyph>
            </Pressable>
          );
        }),
      [reactedByCurrentUser, handleSelect],
    );

    if (!visible) return null;

    return (
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: isCurrentUser ? "flex-end" : "flex-start",
        }}
      >
        <Animated.View
          ref={rootRef}
          style={animatedStyle}
          pointerEvents="auto"
          onStartShouldSetResponder={() => true}
          onResponderStart={(e) => e.stopPropagation?.()}
          className="z-20"
        >
          <View className="flex-row w-fit p-1.5 items-center rounded-full shadow-lg bg-secondary-light dark:bg-secondary-dark border border-gray-200 dark:border-gray-600">
            {emojiButtons}
          </View>
        </Animated.View>
      </View>
    );
  },
);

ReactionPicker.displayName = "ReactionPicker";
export default ReactionPicker;
