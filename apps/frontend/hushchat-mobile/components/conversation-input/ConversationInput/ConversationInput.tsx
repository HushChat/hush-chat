import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import ConversationInputMobile from "@/components/conversation-input/ConversationInput/ConversationInputMobile";
import ConversationInputWeb from "@/components/conversation-input/ConversationInput/ConversationInputWeb";
import { ConversationInputProps } from "@/types/chat/types";
import { PLATFORM } from "@/constants/platformConstants";

const INTERFACE_COMPONENTS = {
  mobile: ConversationInputMobile,
  web: ConversationInputWeb,
} as const;

type InterfaceComponent = (typeof INTERFACE_COMPONENTS)[keyof typeof INTERFACE_COMPONENTS];

export default function ConversationInput(props: ConversationInputProps) {
  const isMobileLayout = useIsMobileLayout();

  const mobileSelected = !PLATFORM.IS_WEB || isMobileLayout;

  const SelectedComponent: InterfaceComponent = mobileSelected
    ? INTERFACE_COMPONENTS.mobile
    : INTERFACE_COMPONENTS.web;

  return <SelectedComponent {...props} />;
}
