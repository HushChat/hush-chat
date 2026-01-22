import { router } from "expo-router";

import {
  GROUP_CONVERSATION_SELECT_PARTICIPANTS,
  MENTIONED_MESSAGES,
  SETTINGS_CONTACT,
  SETTINGS_INVITE,
  SETTINGS_WORKSPACE,
} from "@/constants/routes";

import { BottomSheetOption } from "@/components/BottomSheet";

type TConversationSidebarActionConfig = {
  hasMultipleWorkspaces: boolean;
  closeActionSheet: () => void;
};

export function getConversationSidebarActionOptions({
  hasMultipleWorkspaces,
  closeActionSheet,
}: TConversationSidebarActionConfig): BottomSheetOption[] {
  const sidebarActions: BottomSheetOption[] = [
    {
      id: "create_new_group_conversation",
      title: "New group",
      icon: "people-outline",
      onPress: () => {
        closeActionSheet();
        router.push(GROUP_CONVERSATION_SELECT_PARTICIPANTS);
      },
    },
    {
      id: "view_mentioned_messages",
      title: "Mentioned messages",
      icon: "at-outline",
      onPress: () => {
        closeActionSheet();
        router.push(MENTIONED_MESSAGES);
      },
    },
    {
      id: "open_contacts_settings",
      title: "Contacts",
      icon: "chatbubble-outline",
      onPress: () => {
        closeActionSheet();
        router.push(SETTINGS_CONTACT);
      },
    },
    {
      id: "invite_people_to_workspace",
      title: "Invite",
      icon: "person-add",
      onPress: () => {
        closeActionSheet();
        router.push(SETTINGS_INVITE);
      },
    },
  ];

  if (hasMultipleWorkspaces) {
    sidebarActions.push({
      id: "switch_active_workspace",
      title: "Switch workspace",
      icon: "aperture-outline",
      onPress: () => {
        closeActionSheet();
        router.push(SETTINGS_WORKSPACE);
      },
    });
  }

  return sidebarActions;
}
