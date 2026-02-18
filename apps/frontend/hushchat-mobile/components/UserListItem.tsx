import { TUser } from "@/types/user/types";
import { Ionicons } from "@expo/vector-icons";
import InitialsAvatar from "@/components/InitialsAvatar";
import { AppText } from "@/components/AppText";
import { ListItem } from "@/components/ui/ListItem";

interface UserListItemProps {
  user: TUser;
  isSelected: boolean;
  onToggle: (user: TUser) => void;
}

const UserListItem = ({ user, isSelected, onToggle }: UserListItemProps) => {
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <ListItem
      leading={<InitialsAvatar name={fullName || "Unknown User"} imageUrl={user.signedImageUrl} />}
      title={fullName || "Unknown User"}
      subtitle={
        <AppText className="text-gray-600 dark:text-text-secondary-dark text-sm" numberOfLines={1}>
          {user.email}
        </AppText>
      }
      trailing={
        isSelected ? <Ionicons name="checkmark-circle" size={20} color="#6B4EFF" /> : undefined
      }
      onPress={() => onToggle(user)}
      selected={isSelected}
    />
  );
};

export default UserListItem;
