import { PLATFORM } from "@/constants/platformConstants";
import { TUser } from "@/types/user/types";
import classNames from "classnames";
import { Pressable, TouchableOpacity, View, Text } from "react-native";
import InitialsAvatar from "@/components/InitialsAvatar";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { Ionicons } from "@expo/vector-icons";

interface UserListItemProps {
  user: TUser;
  isSelected: boolean;
  onToggle: (user: TUser) => void;
}

const UserListItem = ({ user, isSelected, onToggle }: UserListItemProps) => {
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const handlePress = () => onToggle(user);

  return (
    <Pressable
      className={classNames(
        "group flex-row items-center gap-3 px-4 py-3 active:bg-secondary-light dark:active:bg-secondary-dark",
        PLATFORM.IS_WEB && "hover:bg-blue-100/60 hover:dark:bg-secondary-dark",
        {
          "bg-blue-100/60 dark:bg-secondary-dark": isSelected,
        }
      )}
      onPress={handlePress}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={DEFAULT_ACTIVE_OPACITY}>
        <InitialsAvatar name={fullName || "Unknown User"} imageUrl={user.signedImageUrl} />
      </TouchableOpacity>

      <View className="flex-1 flex-row justify-between items-center mr-3">
        <View className="flex-col items-start mb-1 gap-0.5">
          <Text className="text-text-primary-light dark:text-text-primary-dark font-medium text-base text-start">
            {fullName || "Unknown User"}
          </Text>
          <Text
            className="text-gray-600 dark:text-text-secondary-dark text-sm flex-1"
            numberOfLines={1}
          >
            {user.email}
          </Text>
        </View>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            className="!text-primary-light/50 dark:!text-primary-dark"
          />
        )}
      </View>
    </Pressable>
  );
};

export default UserListItem;
