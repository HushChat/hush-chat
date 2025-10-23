import { Ionicons } from '@expo/vector-icons';
import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';

import { DEFAULT_ACTIVE_OPACITY } from '@/constants/ui';
import { colorScheme } from 'nativewind';
import { DOC_EXTENSIONS, SIZES } from '@/constants/mediaConstants';

interface TFilePreviewItemProps {
  file: File;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: (index: number) => void;
}

const K = 1024;

const SelectedBadge = () => (
  <View className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full items-center justify-center bg-primary-light dark:bg-primary-dark">
    <Ionicons name="checkmark" size={12} color="#fff" />
  </View>
);

const ImagePreview = ({ uri, isSelected }: { uri: string; isSelected: boolean }) => (
  <View className="relative mr-3">
    <Image
      source={{ uri }}
      style={{ width: 48, height: 48 }}
      className="rounded-lg"
      cachePolicy="memory-disk"
    />
    {isSelected && <SelectedBadge />}
  </View>
);

const DocumentPreview = ({
  extension,
  iconColor,
  isSelected,
}: {
  extension: string;
  iconColor: string;
  isSelected: boolean;
}) => (
  <View className="relative mr-3 w-12 h-12 rounded-lg items-center justify-center bg-gray-200 dark:bg-gray-700">
    <Ionicons name="document-text" size={24} color={iconColor} />
    <Text className="text-[8px] font-bold mt-0.5" style={{ color: iconColor }}>
      {extension}
    </Text>
    {isSelected && <SelectedBadge />}
  </View>
);

export const FilePreviewItem = ({
  file,
  index,
  isSelected,
  onSelect,
  onRemove,
}: TFilePreviewItemProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fileType, setFileType] = useState<'image' | 'document'>('image');

  useEffect(() => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const isDocument = DOC_EXTENSIONS.includes(ext || '');
    setFileType(isDocument ? 'document' : 'image');

    if (!isDocument) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const prettySize = useMemo(() => {
    const bytes = file?.size ?? 0;
    if (bytes === 0) return '0 Bytes';
    const i = Math.min(SIZES.length - 1, Math.floor(Math.log(bytes) / Math.log(K)));
    return `${parseFloat((bytes / Math.pow(K, i)).toFixed(2))} ${SIZES[i]}`;
  }, [file]);

  const fileExtension = useMemo(() => {
    const ext = file?.name.split('.').pop()?.toUpperCase();
    return ext || 'FILE';
  }, [file]);

  const isDark = colorScheme.get() === 'dark';
  const iconColor = isDark ? '#ffffff' : '#6B4EFF';

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
      className={classNames(
        'w-56 relative mb-2 rounded-xl p-2 border',
        'bg-secondary-light/60 dark:bg-secondary-dark/70',
        'border-gray-200 dark:border-gray-700',
        isSelected && 'border border-primary-light dark:border-primary-dark shadow-sm',
      )}
    >
      <View className="flex-row items-center">
        {fileType === 'image' ? (
          <ImagePreview uri={imageUrl} isSelected={isSelected} />
        ) : (
          <DocumentPreview
            extension={fileExtension}
            iconColor={iconColor}
            isSelected={isSelected}
          />
        )}

        <View className="flex-1 min-w-0 pr-2">
          <Text
            className="text-[12px] leading-[16px] font-semibold text-text-primary-light dark:text-text-primary-dark"
            numberOfLines={2}
          >
            {file?.name || 'file'}
          </Text>

          <View className="mt-1 flex-row items-center">
            <View className="px-1.5 py-0.5 rounded bg-secondary-light/80 dark:bg-secondary-dark/80">
              <Text className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                {prettySize}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onRemove(index)}
          className="ml-1 p-1 rounded-md bg-transparent"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
