import { router } from "expo-router";
import {
  GROUP_CONVERSATION_SELECT_PARTICIPANTS,
  MENTIONED_MESSAGES,
  SETTINGS_CONTACT,
  SETTINGS_INVITE,
  SETTINGS_WORKSPACE,
} from "@/constants/routes";
import { BottomSheetOption } from "@/components/BottomSheet";

type Params = {
  hasMultipleWorkspaces: boolean;
  closeSheet: () => void;
};

export function getConversationSidebarSheetOptions({
  hasMultipleWorkspaces,
  closeSheet,
}: Params): BottomSheetOption[] {
  const options: BottomSheetOption[] = [
    {
      id: "create-group",
      title: "New group",
      icon: "people-outline",
      onPress: () => {
        closeSheet();
        router.push(GROUP_CONVERSATION_SELECT_PARTICIPANTS);
      },
    },
    {
      id: "mentioned-messages",
      title: "Mentioned messages",
      icon: "at-outline",
      onPress: () => {
        closeSheet();
        router.push(MENTIONED_MESSAGES);
      },
    },
    {
      id: "contact",
      title: "Contacts",
      icon: "chatbubble-outline",
      onPress: () => {
        closeSheet();
        router.push(SETTINGS_CONTACT);
      },
    },
    {
      id: "invite",
      title: "Invite",
      icon: "person-add",
      onPress: () => {
        closeSheet();
        router.push(SETTINGS_INVITE);
      },
    },
  ];

  if (hasMultipleWorkspaces) {
    options.push({
      id: "change-workspace",
      title: "Change workspace",
      icon: "aperture-outline",
      onPress: () => {
        closeSheet();
        router.push(SETTINGS_WORKSPACE);
      },
    });
  }

  return options;
}
