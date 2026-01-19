import React from "react";
import { View } from "react-native";
import { IMessageAttachment } from "@/types/chat/types";

import { MediaItem } from "@/components/conversations/conversation-thread/message-list/file-upload/ImageGrid/MediaItem";
import {
  staticStyles,
  dynamicStyles,
  GRID_CONFIG,
} from "@/components/conversations/conversation-thread/message-list/file-upload/ImageGrid/imageGrid.styles";

type TImageGridProps = {
  images: IMessageAttachment[];
  onImagePress: (index: number) => void;
};

export const ImageGrid = ({ images, onImagePress }: TImageGridProps) => {
  const displayImages = images.slice(0, GRID_CONFIG.MAX_DISPLAY_IMAGES);
  const remainingCount = Math.max(0, images.length - GRID_CONFIG.MAX_DISPLAY_IMAGES);

  const aspectRatio = 4 / 3;

  const renderSingleImage = () => (
    <View style={staticStyles.singleImageContainer}>
      <MediaItem
        attachment={displayImages[0]}
        style={dynamicStyles.singleImage(aspectRatio)}
        onPress={() => onImagePress(0)}
      />
    </View>
  );

  const renderTwoImages = () => (
    <View style={[staticStyles.flexRow, staticStyles.gap]}>
      <MediaItem
        attachment={displayImages[0]}
        style={dynamicStyles.twoImagesImage}
        onPress={() => onImagePress(0)}
      />
      <MediaItem
        attachment={displayImages[1]}
        style={dynamicStyles.twoImagesImage}
        onPress={() => onImagePress(1)}
      />
    </View>
  );

  const renderThreeImages = () => (
    <View style={[staticStyles.flexRow, staticStyles.gap]}>
      <MediaItem
        attachment={displayImages[0]}
        style={dynamicStyles.threeImagesLarge}
        onPress={() => onImagePress(0)}
      />

      <View style={staticStyles.gap}>
        <MediaItem
          attachment={displayImages[1]}
          style={dynamicStyles.threeImagesSmall}
          onPress={() => onImagePress(1)}
        />
        <MediaItem
          attachment={displayImages[2]}
          style={dynamicStyles.threeImagesSmall}
          onPress={() => onImagePress(2)}
        />
      </View>
    </View>
  );

  const renderFourOrMoreImages = () => (
    <View style={[staticStyles.flexRow, staticStyles.gap]}>
      <View style={staticStyles.gap}>
        <MediaItem
          attachment={displayImages[0]}
          style={dynamicStyles.fourImagesImage}
          onPress={() => onImagePress(0)}
        />
        <MediaItem
          attachment={displayImages[1]}
          style={dynamicStyles.fourImagesImage}
          onPress={() => onImagePress(1)}
        />
      </View>

      <View style={staticStyles.gap}>
        <MediaItem
          attachment={displayImages[2]}
          style={dynamicStyles.fourImagesImage}
          onPress={() => onImagePress(2)}
        />
        <MediaItem
          attachment={displayImages[3]}
          style={dynamicStyles.fourImagesImage}
          onPress={() => onImagePress(3)}
          showOverlay={remainingCount > 0}
          remainingCount={remainingCount}
        />
      </View>
    </View>
  );

  switch (displayImages.length) {
    case 1:
      return renderSingleImage();
    case 2:
      return renderTwoImages();
    case 3:
      return renderThreeImages();
    default:
      return renderFourOrMoreImages();
  }
};
