import React, { memo, useMemo, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import classNames from 'classnames';
import { ReactionSummary, ReactionType } from '@/types/chat/types';
import { REACTION_META } from '@/constants/reactions';
import { PLATFORM } from '@/constants/platformConstants';

const ORDER: ReactionType[] = [
  ReactionType.THUMBS_UP,
  ReactionType.LOVE,
  ReactionType.HAHA,
  ReactionType.WOW,
  ReactionType.ANGRY,
  ReactionType.SAD,
];

interface MessageReactionsSummaryProps {
  reactions?: ReactionSummary;
  isCurrentUser?: boolean;
  onPress?: (position: { x: number; y: number }, isOpen: boolean) => void;
}

const MessageReactionsSummary = memo(
  ({ reactions, isCurrentUser, onPress }: MessageReactionsSummaryProps) => {
    const buttonRef = useRef<View>(null);

    const { topEmojis, totalReactions } = useMemo(() => {
      if (!reactions?.counts) {
        return { topEmojis: [] as string[], totalReactions: 0 };
      }

      const reactionCounts: { type: ReactionType; count: number }[] = ORDER.map((reactionType) => ({
        type: reactionType,
        count: reactions.counts[reactionType] ?? 0,
      })).filter((reaction) => reaction.count > 0);

      const totalReactions = reactionCounts.reduce((sum, reaction) => sum + reaction.count, 0);

      if (totalReactions === 0) {
        return { topEmojis: [], totalReactions: 0 };
      }

      reactionCounts.sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return ORDER.indexOf(a.type) - ORDER.indexOf(b.type);
      });

      const topEmojis = reactionCounts
        .slice(0, 4)
        .map((reaction) => REACTION_META[reaction.type].emoji);

      return { topEmojis, totalReactions };
    }, [reactions]);

    const handlePress = () => {
      if (!onPress) return;

      if (PLATFORM.IS_WEB) {
        buttonRef.current?.measureInWindow((x, y, width, height) => {
          onPress(
            {
              x: x,
              y: y + height + 8,
            },
            true,
          );
        });
      } else {
        onPress({ x: 0, y: 0 }, true);
      }
    };

    if (!totalReactions) return null;

    return (
      <Pressable
        ref={buttonRef}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Reactions, total ${totalReactions}`}
        className={classNames(
          'flex-row rounded-2xl items-center px-2 py-1',
          'bg-secondary-light dark:bg-secondary-dark',
          isCurrentUser ? 'self-end' : 'self-start',
        )}
      >
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center">
            {topEmojis.map((emoji, index) => (
              <Text key={`${emoji}-${index}`} className="text-base">
                {emoji}
              </Text>
            ))}
          </View>
          <Text className="text-sm text-gray-700 dark:text-gray-200">{totalReactions}</Text>
        </View>
      </Pressable>
    );
  },
);

MessageReactionsSummary.displayName = 'MessageReactionsSummary';
export default MessageReactionsSummary;
