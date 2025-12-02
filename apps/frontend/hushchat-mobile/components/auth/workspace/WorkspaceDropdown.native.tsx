import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";
import { PLATFORM } from "@/constants/platformConstants";
import { STATUS_STYLES, Workspace, WorkspaceDropdownProps } from "@/types/login/types";
import { SIZE_PRESETS } from "@/components/forms/TextField";

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
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  const effectiveSize: SizeKey = useMemo(() => {
    if (size) return size;
    if (!platformAwareDefault) return "md";
    return PLATFORM.IS_WEB ? "lg" : "md";
  }, [size, platformAwareDefault]);

  const tokens = SIZE_PRESETS[effectiveSize];

  const inputBase =
    "border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 " +
    "bg-white dark:bg-gray-900";

  const openDropdown = () => {
    setIsOpen(true);
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
  };

  const closeDropdown = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, {
      duration: 250,
      easing: Easing.in(Easing.cubic),
    });
    opacity.value = withTiming(0, { duration: 250, easing: Easing.in(Easing.quad) });
    setTimeout(() => setIsOpen(false), 250);
  };

  const handleSelect = (workspace: Workspace) => {
    onSelectWorkspace(workspace);
    closeDropdown();
  };

  const getStatusBadge = (status: string) => {
    const style = STATUS_STYLES[status];

    return (
      <View className={`${style.bg} px-2 py-0.5 rounded`}>
        <Text className={`${style.text} text-xs font-medium`}>{style.label}</Text>
      </View>
    );
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View className="flex-col gap-y-1">
      {label && (
        <Text className={`text-gray-900 dark:text-gray-100 font-medium ${tokens.label}`}>
          {label}
        </Text>
      )}

      <View className="flex-col gap-y-1">
        <Pressable onPress={() => openDropdown()}>
          <View
            className={`${inputBase} ${tokens.px} ${tokens.py} ${tokens.inputHeight} ${tokens.radius} flex-row items-center justify-between`}
          >
            <Text
              className={`${tokens.font} ${
                selectedWorkspace ? "text-gray-900 dark:text-gray-100" : "text-gray-400"
              }`}
            >
              {selectedWorkspace ? selectedWorkspace.name : placeholder}
            </Text>
            <Ionicons
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={tokens.iconSize}
              color="#9CA3AF"
            />
          </View>
        </Pressable>

        {formErrors?.[errorKey] && showErrors && (
          <Text className={`text-red-600 ${tokens.error}`}>{formErrors[errorKey]}</Text>
        )}
      </View>

      <Modal
        transparent
        visible={isOpen}
        onRequestClose={() => closeDropdown()}
        animationType="none"
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => closeDropdown()}>
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[styles.sheet, sheetStyle]}
                className="bg-white dark:bg-gray-900 rounded-t-3xl"
              >
                <View className="items-center py-3">
                  <View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </View>

                <View className="px-4 pb-2">
                  <Text className="text-lg font-semibold text-center text-gray-900 dark:text-gray-100">
                    Select Workspace
                  </Text>
                </View>

                <View className="px-4 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
                  {workspaces.length === 0 || loading ? (
                    <View className="p-8 items-center">
                      <Text className="text-gray-500 dark:text-gray-400 text-center">
                        No workspaces available
                      </Text>
                    </View>
                  ) : (
                    <ScrollView
                      showsVerticalScrollIndicator={true}
                      style={{ maxHeight: SCREEN_HEIGHT * 0.6 }}
                    >
                      {workspaces.map((item, index) => (
                        <Pressable
                          key={item.id.toString()}
                          onPress={() => handleSelect(item)}
                          className={`py-4 px-2 ${
                            index < workspaces.length - 1
                              ? "border-b border-gray-200 dark:border-gray-700"
                              : ""
                          }`}
                        >
                          <View className="flex-row items-start justify-between gap-3">
                            <View className="flex-1">
                              <Text
                                className={`${tokens.font} font-semibold text-gray-900 dark:text-gray-100 mb-1`}
                              >
                                {item.name}
                              </Text>
                              {item.description && (
                                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {item.description}
                                </Text>
                              )}
                              {getStatusBadge(item.status)}
                            </View>
                            {selectedWorkspace?.id === item.id && (
                              <View className="w-10 h-10 rounded-full items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                              </View>
                            )}
                          </View>
                        </Pressable>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default WorkspaceDropdown;
