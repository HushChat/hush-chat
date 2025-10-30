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

import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import React from "react";
import {
  Modal,
  View,
  Pressable,
  TouchableWithoutFeedback,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { PLATFORM } from "@/constants/platformConstants";
import { AppText } from "./AppText";

export const MODAL_TYPES = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
  confirm: "confirm",
  custom: "custom",
} as const;

export const MODAL_BUTTON_VARIANTS = {
  default: "default",
  primary: "primary",
  destructive: "destructive",
} as const;

const MAX_INLINE_BUTTONS = 2;

type ModalType = keyof typeof MODAL_TYPES;
type ModalButtonVariant = keyof typeof MODAL_BUTTON_VARIANTS;

export interface ModalButton {
  text: string;
  onPress: () => void;
  variant?: ModalButtonVariant;
  className?: string;
}

export interface ModalProps {
  visible: boolean;
  type?: ModalType;
  title?: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  buttons?: ModalButton[];
  onClose?: () => void;
  closeOnBackdropPress?: boolean;
  children?: React.ReactNode;
}

const buttonVariantClasses: Record<
  ModalButtonVariant,
  { backgroundColor: string; textColor: string }
> = {
  default: {
    backgroundColor: "bg-gray-200 dark:bg-neutral-800",
    textColor: "text-gray-800 dark:text-gray-200",
  },
  primary: { backgroundColor: "bg-blue-500", textColor: "text-white" },
  destructive: { backgroundColor: "bg-red-500", textColor: "text-white" },
};

const typeColor: Partial<Record<ModalType, string>> & { default: string } = {
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
  confirm: "bg-blue-500",
  default: "bg-gray-500",
};

const getTypeColor = (type: ModalType) => typeColor[type] || typeColor.default;

export default function AppModal({
  visible,
  type = MODAL_TYPES.info,
  title,
  description,
  icon,
  buttons = [],
  onClose,
  closeOnBackdropPress = true,
  children,
}: ModalProps) {
  const { width } = useWindowDimensions();

  const renderButtons = (btns: ModalButton[]) =>
    btns.map((btn, idx) => {
      const variant = btn.variant ?? MODAL_BUTTON_VARIANTS.default;
      const { backgroundColor, textColor } = buttonVariantClasses[variant];
      return (
        <Pressable
          key={idx}
          onPress={btn.onPress}
          className={classNames(
            "px-4 py-2 rounded-lg min-w-[120px]",
            backgroundColor,
            btn.className,
          )}
        >
          <AppText className={classNames("font-medium text-center", textColor)}>
            {btn.text}
          </AppText>
        </Pressable>
      );
    });

  const renderModalContent = () => (
    <View
      style={{
        width: width > 500 ? 400 : "100%",
        maxWidth: 500,
        borderRadius: 12,
        padding: 20,
      }}
      className="bg-white dark:bg-neutral-900"
    >
      {icon && (
        <View
          className={classNames(
            "self-center mb-4 p-3 rounded-full",
            getTypeColor(type),
          )}
        >
          <Ionicons name={icon} size={28} color="white" />
        </View>
      )}

      {title && (
        <AppText className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center">
          {title}
        </AppText>
      )}

      {description && (
        <AppText className="mt-2 text-gray-600 dark:text-gray-400 text-center">
          {description}
        </AppText>
      )}

      {type === MODAL_TYPES.custom && <View className="mt-4">{children}</View>}

      {buttons.length > 0 && (
        <View
          className={classNames("flex-row justify-center gap-2 mt-6", {
            "flex-col items-center gap-2 mt-6":
              buttons.length > MAX_INLINE_BUTTONS,
          })}
        >
          {renderButtons(buttons)}
        </View>
      )}
    </View>
  );

  if (!visible) return null;

  if (PLATFORM.IS_WEB) {
    return (
      <View
        style={StyleSheet.absoluteFillObject}
        className="z-50 justify-center items-center px-5"
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (closeOnBackdropPress) onClose?.();
          }}
        >
          <View style={StyleSheet.absoluteFillObject} className="bg-black/50" />
        </TouchableWithoutFeedback>
        {renderModalContent()}
      </View>
    );
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <Pressable
          onPress={closeOnBackdropPress ? onClose : undefined}
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.5)" },
          ]}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
            },
          ]}
          pointerEvents="box-none"
        >
          {renderModalContent()}
        </View>
      </View>
    </Modal>
  );
}
