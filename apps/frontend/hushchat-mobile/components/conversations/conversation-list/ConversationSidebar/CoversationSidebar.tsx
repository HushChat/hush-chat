import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

import { PLATFORM } from "@/constants/platformConstants";
import ConversationSidebarMobile from "@/components/conversations/conversation-list/ConversationSidebar/ConversationSidebarMobile";
import ConversationSidebarWeb from "@/components/conversations/conversation-list/ConversationSidebar/ConversationSidebarWeb";

const INTERFACE_COMPONENTS = {
  mobile: ConversationSidebarMobile,
  web: ConversationSidebarWeb,
} as const;

type InterfaceComponent = (typeof INTERFACE_COMPONENTS)[keyof typeof INTERFACE_COMPONENTS];

export default function ConversationSidebar() {
  const isMobileLayout = useIsMobileLayout();

  const mobileSelected = !PLATFORM.IS_WEB || isMobileLayout;

  const SelectedComponent: InterfaceComponent = mobileSelected
    ? INTERFACE_COMPONENTS.mobile
    : INTERFACE_COMPONENTS.web;

  return <SelectedComponent />;
}
