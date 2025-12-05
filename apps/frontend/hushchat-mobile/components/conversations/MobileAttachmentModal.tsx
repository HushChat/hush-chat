/**
 * MobileAttachmentModal
 *
 * Modal component for selecting attachment type on mobile devices
 */

import React from "react";
import { Modal, TouchableOpacity, View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { ToastUtils } from "@/utils/toastUtils";
import { logError } from "@/utils/logger";
import { MotionView } from "@/motion/MotionView";

export type AttachmentOption = "images" | "documents";

type MobileAttachmentModalProps = {
  visible: boolean;
  onClose: () => void;
  onOpenImagePicker?: () => void | Promise<void>;
  onOpenDocumentPicker?: () => void | Promise<void>;
};

const MobileAttachmentModal = ({
  visible,
  onClose,
  onOpenImagePicker,
  onOpenDocumentPicker,
}: MobileAttachmentModalProps) => {
  const handleOptionPress = (option: AttachmentOption, pickerFn?: () => void | Promise<void>) => {
    if (!pickerFn) return;

    try {
      pickerFn();
      onClose();
    } catch (error) {
      const optionLabel = option === "images" ? "image" : "document";
      logError(`Failed to open ${optionLabel} picker`, error);
      ToastUtils.error(`Unable to open ${optionLabel} picker. Please try again.`);
      onClose();
    }
  };

  const showImages = !!onOpenImagePicker;
  const showDocuments = !!onOpenDocumentPicker;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <MotionView visible={visible} preset="fadeIn" duration={200} className="flex-1">
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose}>
          <MotionView
            visible={visible}
            from={{ opacity: 0, scale: 0.9, translateY: 15 }}
            to={{ opacity: 1, scale: 1, translateY: 0 }}
            duration={250}
            easing="springy"
            style={styles.menuContainer}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[200px]"
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {showImages && (
              <TouchableOpacity
                className="flex-row items-center py-3 px-4 active:bg-gray-100 dark:active:bg-gray-700"
                onPress={() => handleOptionPress("images", onOpenImagePicker)}
              >
                <MaterialIcons name="photo-library" size={20} color="#3B82F6" />
                <AppText className="text-sm ml-3 text-gray-900 dark:text-gray-100 font-medium">
                  Upload Images
                </AppText>
              </TouchableOpacity>
            )}

            {showImages && showDocuments && <View className="h-px bg-gray-200 dark:bg-gray-700" />}

            {showDocuments && (
              <TouchableOpacity
                className="flex-row items-center py-3 px-4 active:bg-gray-100 dark:active:bg-gray-700"
                onPress={() => handleOptionPress("documents", onOpenDocumentPicker)}
              >
                <MaterialIcons name="insert-drive-file" size={20} color="#3B82F6" />
                <AppText className="text-sm ml-3 text-gray-900 dark:text-gray-100 font-medium">
                  Upload Documents
                </AppText>
              </TouchableOpacity>
            )}
          </MotionView>
        </TouchableOpacity>
      </MotionView>
    </Modal>
  );
};

export default MobileAttachmentModal;

const styles = StyleSheet.create({
  menuContainer: {
    position: "absolute",
    bottom: 80,
    left: 16,
  },
});
