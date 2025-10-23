import { TouchableOpacity } from 'react-native';
import React from 'react';
import classNames from 'classnames';
import { DEFAULT_HIT_SLOP } from '@/constants/ui';
import { AppText } from '@/components/AppText';

interface FilterButtonProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}

const FilterButton = ({ label, isActive = false, onPress }: FilterButtonProps) => {
  return (
    <TouchableOpacity
      className={classNames('px-4 py-2 rounded-full', {
        'bg-blue-100 dark:bg-[#162446] border border-primary-light dark:border-primary-dark':
          isActive,
        'bg-gray-100 dark:bg-gray-800': !isActive,
      })}
      hitSlop={DEFAULT_HIT_SLOP}
      onPress={onPress}
    >
      <AppText
        className={classNames('font-medium', {
          'text-primary-light dark:text-text-primary-dark': isActive,
          'text-gray-600 dark:text-text-secondary-dark': !isActive,
        })}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

export default FilterButton;
