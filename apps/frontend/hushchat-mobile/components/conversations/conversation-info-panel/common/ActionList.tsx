import ActionItem from "@/components/conversations/conversation-info-panel/common/ActionItem";

interface IOption {
  state?: boolean;
  handler?: () => void;
}

interface ActionListProps {
  pinOption?: IOption;
  favoriteOption?: IOption;
  mutedOption?: IOption;
  deleteOption?: IOption;
  archiveChatOption?: IOption;
}

export default function ActionList({
  pinOption,
  favoriteOption,
  mutedOption,
  deleteOption,
}: ActionListProps) {
  return (
    <>
      {pinOption?.state !== undefined && pinOption.handler && (
        <ActionItem
          icon={pinOption.state ? "pin-outline" : "pin"}
          label={pinOption.state ? "Unpin Conversation" : "Pin Conversation"}
          onPress={pinOption.handler}
        />
      )}

      {favoriteOption?.state !== undefined && favoriteOption.handler && (
        <ActionItem
          icon={favoriteOption.state ? "heart" : "heart-outline"}
          label={favoriteOption.state ? "Remove from Favorites" : "Add to Favorites"}
          onPress={favoriteOption.handler}
        />
      )}

      {mutedOption?.state !== undefined && mutedOption.handler && (
        <ActionItem
          icon={mutedOption.state ? "notifications-off-outline" : "notifications-outline"}
          label={mutedOption.state ? "Unmute Conversation" : "Mute Conversation"}
          onPress={mutedOption.handler}
        />
      )}

      {deleteOption?.handler && (
        <ActionItem
          icon={"trash-bin-outline"}
          label={"Delete Conversation"}
          onPress={deleteOption.handler}
          color="#EF4444"
          critical={true}
        />
      )}
    </>
  );
}
