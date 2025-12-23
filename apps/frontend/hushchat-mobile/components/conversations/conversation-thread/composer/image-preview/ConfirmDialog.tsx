import React from "react";
import { Modal, View, Pressable } from "react-native";

import { AppText } from "@/components/AppText";
import { MotionView } from "@/motion/MotionView";
import { IConfirmDialogProps } from "@/types/chat/types";

export const ConfirmDialog = ({ visible, onCancel, onConfirm }: IConfirmDialogProps) => (
  <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
    <MotionView
      visible={visible}
      preset="fadeIn"
      duration={200}
      className="flex-1 justify-center items-center bg-black/50"
    >
      <MotionView
        visible={visible}
        preset="scaleIn"
        easing="springy"
        duration={300}
        className="w-[85%] bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-xl"
      >
        <AppText className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          File Already Saved
        </AppText>
        <AppText className="text-base text-gray-600 dark:text-gray-300 mb-6 leading-5">
          Do you want to save it to your gallery again?
        </AppText>
        <View className="flex-row justify-end gap-3">
          <Pressable
            onPress={onCancel}
            className="px-4 py-2.5 rounded-lg active:bg-gray-100 dark:active:bg-gray-800"
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <AppText className="text-base font-medium text-gray-600 dark:text-gray-400">
              Cancel
            </AppText>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            className="px-4 py-2.5 bg-primary-light dark:bg-primary-dark rounded-lg active:opacity-90"
            accessibilityRole="button"
            accessibilityLabel="Save again"
          >
            <AppText className="text-base font-bold text-white">Save Again</AppText>
          </Pressable>
        </View>
      </MotionView>
    </MotionView>
  </Modal>
);

export default ConfirmDialog;
