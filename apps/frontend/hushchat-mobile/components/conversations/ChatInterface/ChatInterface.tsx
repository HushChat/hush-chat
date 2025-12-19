import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

import ChatInterfaceMobile from "./ChatInterfaceMobile";
import { PLATFORM } from "@/constants/platformConstants";
import ChatInterfaceWeb from "@/components/conversations/ChatInterface/ChatInterfaceWeb";
import { ChatComponentProps } from "@/types/chat/types";

const INTERFACE_COMPONENTS = {
  mobile: ChatInterfaceMobile,
  web: ChatInterfaceWeb,
} as const;

type InterfaceComponent = (typeof INTERFACE_COMPONENTS)[keyof typeof INTERFACE_COMPONENTS];

export default function ChatInterface(props: ChatComponentProps) {
  const isMobileLayout = useIsMobileLayout();

  const mobileSelected = !PLATFORM.IS_WEB || isMobileLayout;

  const SelectedComponent: InterfaceComponent = mobileSelected
    ? INTERFACE_COMPONENTS.mobile
    : INTERFACE_COMPONENTS.web;

  return <SelectedComponent {...props} />;
}
