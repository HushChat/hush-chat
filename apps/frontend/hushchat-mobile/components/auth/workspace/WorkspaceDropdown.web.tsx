import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import { FlatList, Modal, Pressable, Text, View, TouchableWithoutFeedback } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";
import { Workspace, WorkspaceDropdownProps } from "@/types/login/types";
import { SIZE_PRESETS } from "@/components/forms/TextField";
// Import the new component
import WorkspaceDropdownItem from "./WorkspaceDropdownItem";

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

  // NOTE: getStatusBadge function has been removed as it is now inside WorkspaceDropdownItem

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

      <Modal visible={isOpen} transparent={true} onRequestClose={() => setIsOpen(false)}>
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
                      <WorkspaceDropdownItem
                        item={item}
                        isSelected={selectedWorkspace?.id === item.id}
                        onSelect={handleSelect}
                        isLast={index === workspaces.length - 1}
                        tokens={tokens}
                      />
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
