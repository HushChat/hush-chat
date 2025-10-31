import {
  View,
  TouchableOpacity,
  Pressable,
  Modal,
  Dimensions,
} from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { IOption } from "@/types/chat/types";
import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { useAppTheme } from "@/hooks/useAppTheme";
import { AppText } from "./AppText";
import { getAdjustedPosition } from "@/utils/commonUtils";

interface WebChatContextMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  options: IOption[];
  onOptionSelect: (action: () => Promise<void> | void) => Promise<void>;
  iconSize?: number;
}

const WebContextMenu = ({
  visible,
  position,
  onClose,
  options,
  onOptionSelect,
  iconSize = 22,
}: WebChatContextMenuProps) => {
  const modalRef = useRef<View>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;
  const { isDark } = useAppTheme();

  const modalHeight = options.length * 52 + 20;
  const modalWidth = 220;

  const adjustedPosition = getAdjustedPosition(
    position,
    screenWidth,
    screenHeight,
    modalWidth,
    modalHeight,
  );

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 160);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 120);
  };

  return (
    <Modal
      transparent={true}
      visible={shouldRender}
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1"
        onPress={handleClose}
        style={{ cursor: "auto" }}
      >
        <View
          ref={modalRef}
          pointerEvents="box-none"
          className={classNames(
            "absolute rounded-xl overflow-hidden border backdrop-blur-md transition-all duration-200 ease-out",
            isDark
              ? "bg-secondary-dark/95 border-[#2C3650]/60"
              : "bg-white/90 border-[#E5E7EB]/70",
          )}
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
            opacity: isAnimating ? 1 : 0,
            transform: [
              { scale: isAnimating ? 1 : 0.95 },
              { translateY: isAnimating ? 0 : 6 },
            ],
            boxShadow: isDark
              ? "0 4px 14px rgba(0,0,0,0.35)"
              : "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={async () => {
                await onOptionSelect(option.action);
                handleClose();
              }}
              activeOpacity={DEFAULT_ACTIVE_OPACITY}
              className={classNames(
                "pl-2 pr-8 py-1.5 flex-row items-center transition-colors duration-150 group rounded-lg m-1",
                option.critical
                  ? "hover:bg-red-100 dark:hover:bg-red-900/30"
                  : "hover:bg-primary-light/10 dark:hover:bg-primary-dark/30",
              )}
            >
              {option.iconComponent ? (
                option.iconComponent({ size: iconSize })
              ) : (
                <Ionicons
                  name={option.iconName}
                  size={iconSize}
                  color={
                    option.critical ? "#ef4444" : isDark ? "#9ca3af" : "#6B7280"
                  }
                />
              )}

              <AppText
                className={classNames(
                  "ml-2 font-medium text-[15px] transition-colors duration-150",
                  option.critical
                    ? "text-red-600 group-hover:text-red-700 dark:group-hover:text-red-400"
                    : isDark
                      ? "text-text-secondary-dark group-hover:text-text-primary-dark"
                      : "text-text-secondary-light group-hover:text-text-primary-light",
                )}
              >
                {option.name}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

export default WebContextMenu;
