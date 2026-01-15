import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { PLATFORM } from "@/constants/platformConstants";
import { STATUS_STYLES, Workspace, WorkspaceDropdownProps } from "@/types/login/types";
import { SIZE_PRESETS } from "@/components/forms/TextField";
import { AppText } from "@/components/AppText";

type SizeKey = NonNullable<WorkspaceDropdownProps["size"]>;

const COLORS = {
  SHADOW: "#000",
};

const styles = StyleSheet.create({
  dropdownContainer: {
    position: "absolute",
    maxHeight: 320,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<View>(null);

  const effectiveSize: SizeKey = useMemo(() => {
    if (size) return size;
    if (!platformAwareDefault) return "md";
    return PLATFORM.IS_WEB ? "lg" : "md";
  }, [size, platformAwareDefault]);

  const tokens = SIZE_PRESETS[effectiveSize];

  const inputBase =
    "border border-violet-200 dark:border-violet-800 text-gray-900 dark:text-gray-100 " +
    "bg-white dark:bg-gray-900";

  const handleOpen = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPosition({
          top: y + height + 4,
          left: x,
          width: width,
        });
        setIsOpen(true);
      });
    }
  };

  const handleSelect = (workspace: Workspace) => {
    onSelectWorkspace(workspace);
    setIsOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const style = STATUS_STYLES[status];

    return (
      <View className={`${style.bg} px-3 py-0.5 rounded-full w-fit`}>
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
        <Pressable onPress={handleOpen}>
          <View
            ref={buttonRef}
            className={`${inputBase} ${tokens.px} ${tokens.py} ${tokens.inputHeight} rounded-xl flex-row items-center justify-between`}
          >
            <AppText
              className={`${tokens.font} ${
                selectedWorkspace ? "text-gray-900 dark:text-gray-100" : "text-gray-400"
              }`}
            >
              {selectedWorkspace ? selectedWorkspace.name : placeholder}
            </AppText>
            <Ionicons
              name={isOpen ? "chevron-up" : "chevron-down"}
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
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdownContainer,
                  {
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                  },
                ]}
                className={`border border-violet-200 dark:border-violet-800 rounded-xl bg-white dark:bg-gray-800 overflow-hidden`}
              >
                {workspaces.length === 0 || loading ? (
                  <View className="p-8 items-center">
                    <AppText className="text-gray-500 dark:text-gray-400 text-center">
                      No workspaces available
                    </AppText>
                  </View>
                ) : (
                  <FlatList
                    data={workspaces}
                    keyExtractor={(item) => item.id.toString()}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={true}
                    renderItem={({ item, index }) => (
                      <Pressable
                        className={`p-4 ${
                          index !== workspaces.length - 1
                            ? "border-b border-violet-100 dark:border-violet-900"
                            : ""
                        } ${
                          selectedWorkspace?.id === item.id
                            ? "bg-violet-50 dark:bg-violet-900/20"
                            : "bg-white dark:bg-gray-800"
                        }`}
                        onPress={() => handleSelect(item)}
                      >
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1">
                            <AppText
                              className={`${tokens.font} font-medium text-gray-900 dark:text-gray-100 mb-1`}
                            >
                              {item.name}
                            </AppText>
                            {item.description && (
                              <AppText
                                className={`${tokens.error} text-gray-600 dark:text-gray-400 mb-2`}
                              >
                                {item.description}
                              </AppText>
                            )}
                            {getStatusBadge(item.status)}
                          </View>
                          {selectedWorkspace?.id === item.id && (
                            <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                          )}
                        </View>
                      </Pressable>
                    )}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default WorkspaceDropdown;
