import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import { FlatList, Modal, Pressable, Text, View, TouchableWithoutFeedback } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";
import { Workspace, WorkspaceDropdownProps } from "@/types/login/types";
import { SIZE_PRESETS } from "@/components/forms/TextField";

type SizeKey = NonNullable<WorkspaceDropdownProps["size"]>;

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
    "border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 " +
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
    if (status === "PENDING") {
      return (
        <View className="bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded">
          <Text className="text-yellow-700 dark:text-yellow-400 text-xs font-medium">
            Invitation Pending
          </Text>
        </View>
      );
    }
    return (
      <View className="bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
        <Text className="text-green-700 dark:text-green-400 text-xs font-medium">Active</Text>
      </View>
    );
  };

  return (
    <View className="flex-col gap-y-1">
      {label && (
        <Text className={`text-gray-900 dark:text-gray-100 font-medium ${tokens.label}`}>
          {label}
        </Text>
      )}

      <View className="flex-col gap-y-1">
        <Pressable onPress={handleOpen}>
          <View
            ref={buttonRef}
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
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  position: "absolute",
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                  maxHeight: 320,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
                className={`border border-gray-300 dark:border-gray-600 ${tokens.radius} bg-white dark:bg-gray-800 overflow-hidden`}
              >
                {workspaces.length === 0 || loading ? (
                  <View className="p-8 items-center">
                    <Text className="text-gray-500 dark:text-gray-400 text-center">
                      No workspaces available
                    </Text>
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
                            ? "border-b border-gray-200 dark:border-gray-700"
                            : ""
                        } ${
                          selectedWorkspace?.id === item.id
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "bg-white dark:bg-gray-800"
                        }`}
                        onPress={() => handleSelect(item)}
                      >
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1">
                            <Text
                              className={`${tokens.font} font-semibold text-gray-900 dark:text-gray-100 mb-1`}
                            >
                              {item.name}
                            </Text>
                            {item.description && (
                              <Text
                                className={`${tokens.error} text-gray-600 dark:text-gray-400 mb-2`}
                              >
                                {item.description}
                              </Text>
                            )}
                            {getStatusBadge(item.status)}
                          </View>
                          {selectedWorkspace?.id === item.id && (
                            <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
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
