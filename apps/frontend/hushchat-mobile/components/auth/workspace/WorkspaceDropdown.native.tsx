import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  View,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { PLATFORM } from "@/constants/platformConstants";
import { STATUS_STYLES, Workspace, WorkspaceDropdownProps } from "@/types/login/types";
import { SIZE_PRESETS } from "@/components/forms/TextField";
import { MotionView } from "@/motion/MotionView";
import { AppText } from "@/components/AppText";

type SizeKey = NonNullable<WorkspaceDropdownProps["size"]>;

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = {
  BACKDROP: "rgba(0, 0, 0, 0.5)",
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.BACKDROP,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

const WorkspaceDropdown = ({
  label,
  placeholder = "Select workspace",
  workspaces = [],
  selectedWorkspace,
  onSelectWorkspace,
  formErrors,
  showErrors,
  errorKey = "workspace",
  size,
  platformAwareDefault = true,
  loading,
}: WorkspaceDropdownProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  const insets = useSafeAreaInsets();

  const workspaceList = Array.isArray(workspaces) ? workspaces : [];

  const effectiveSize: SizeKey = useMemo(() => {
    if (size) return size;
    if (!platformAwareDefault) return "md";
    return PLATFORM.IS_WEB ? "lg" : "md";
  }, [size, platformAwareDefault]);

  const tokens = SIZE_PRESETS[effectiveSize];

  const openDropdown = () => {
    setIsModalVisible(true);
    requestAnimationFrame(() => setIsContentVisible(true));
  };

  const closeDropdown = () => {
    setIsContentVisible(false);
    setTimeout(() => setIsModalVisible(false), 300);
  };

  const handleSelect = (workspace: Workspace) => {
    onSelectWorkspace(workspace);
    closeDropdown();
  };

  const getStatusBadge = (status: string) => {
    const style = STATUS_STYLES[status];

    return (
      <View className={`${style.bg} px-2 py-0.5 rounded-full self-start`}>
        <AppText className={`${style.text} text-xs font-medium`}>{style.label}</AppText>
      </View>
    );
  };

  return (
    <View className="flex-col gap-y-1">
      {label && (
        <AppText className={`text-gray-900 dark:text-gray-100 font-medium ${tokens.label}`}>
          {label}
        </AppText>
      )}

      <View className="flex-col gap-y-1">
        <Pressable onPress={openDropdown}>
          <View
            className={`border border-violet-200 dark:border-violet-800 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 ${tokens.px} ${tokens.py} ${tokens.inputHeight} rounded-xl flex-row items-center justify-between`}
          >
            <AppText
              className={`${tokens.font} ${
                selectedWorkspace ? "text-gray-900 dark:text-gray-100" : "text-gray-400"
              }`}
            >
              {selectedWorkspace ? selectedWorkspace.name : placeholder}
            </AppText>
            <Ionicons
              name={isModalVisible ? "chevron-up" : "chevron-down"}
              size={tokens.iconSize}
              color="#8B5CF6"
            />
          </View>
        </Pressable>

        {formErrors?.[errorKey] && showErrors && (
          <AppText className={`text-red-600 ${tokens.error}`}>{formErrors[errorKey]}</AppText>
        )}
      </View>

      <Modal
        transparent
        visible={isModalVisible}
        onRequestClose={closeDropdown}
        animationType="none"
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={{ flex: 1 }}>
            <MotionView
              visible={isContentVisible}
              preset="fadeIn"
              duration={300}
              style={styles.backdrop}
            />
            <TouchableWithoutFeedback>
              <MotionView
                visible={isContentVisible}
                from={{ translateY: SCREEN_HEIGHT }}
                to={{ translateY: 0 }}
                duration={300}
                easing="emphasized"
                style={styles.sheet}
                className="bg-white dark:bg-gray-900 rounded-t-3xl border-t border-violet-100 dark:border-violet-900"
              >
                <View className="items-center py-3">
                  <View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </View>

                <View className="px-4 pb-2">
                  <AppText className="text-lg font-semibold text-center text-gray-900 dark:text-gray-100">
                    Select Workspace
                  </AppText>
                </View>

                <View className="px-4 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
                  {workspaces.length === 0 || loading ? (
                    <View className="p-8 items-center">
                      <AppText className="text-gray-500 dark:text-gray-400 text-center">
                        No workspaces available
                      </AppText>
                    </View>
                  ) : (
                    <ScrollView
                      showsVerticalScrollIndicator={true}
                      style={{ maxHeight: SCREEN_HEIGHT * 0.6 }}
                    >
                      {workspaceList.map((item, index) => (
                        <MotionView
                          key={item.id.toString()}
                          visible={true}
                          preset="slideUp"
                          delay={index * 50}
                        >
                          <Pressable
                            onPress={() => handleSelect(item)}
                            className={`py-4 px-4 mb-3 rounded-xl border ${
                              selectedWorkspace?.id === item.id
                                ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800"
                                : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700"
                            }`}
                          >
                            <View className="flex-row items-start justify-between gap-3">
                              <View className="flex-1">
                                <AppText
                                  className={`${tokens.font} font-medium text-gray-900 dark:text-gray-100 mb-1`}
                                >
                                  {item.name}
                                </AppText>
                                {item.description && (
                                  <AppText className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {item.description}
                                  </AppText>
                                )}
                                {getStatusBadge(item.status)}
                              </View>
                              {selectedWorkspace?.id === item.id && (
                                <View className="w-8 h-8 rounded-full items-center justify-center bg-violet-100 dark:bg-violet-900/30">
                                  <Ionicons name="checkmark" size={18} color="#8B5CF6" />
                                </View>
                              )}
                            </View>
                          </Pressable>
                        </MotionView>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </MotionView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default WorkspaceDropdown;
