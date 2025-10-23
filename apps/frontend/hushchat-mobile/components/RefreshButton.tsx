import { TouchableOpacity, ActivityIndicator } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import classNames from 'classnames';
import { DEFAULT_ACTIVE_OPACITY } from '@/constants/ui';

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading?: boolean;
  size?: number;
  color?: string;
  disabled?: boolean;
}

export default function RefreshButton({
  onRefresh,
  isLoading = false,
  size = 20,
  color,
  disabled = false,
}: RefreshButtonProps) {
  const handlePress = () => {
    if (!disabled && !isLoading && onRefresh) {
      onRefresh();
    }
  };

  const isDisabled = disabled || isLoading || !onRefresh;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      className={classNames('p-2 rounded-full', {
        'opacity-50': isDisabled,
        'hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600':
          !isDisabled,
      })}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={color || '#6B7280'} />
      ) : (
        <Ionicons name="refresh" size={size} color={color || '#6B7280'} />
      )}
    </TouchableOpacity>
  );
}
