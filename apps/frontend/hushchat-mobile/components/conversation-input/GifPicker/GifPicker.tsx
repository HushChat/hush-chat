import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import { GifPickerMobile } from "@/components/conversation-input/GifPicker/GifPickerMobile";
import { GifPickerWeb } from "@/components/conversation-input/GifPicker/GifPickerWeb";
import { PLATFORM } from "@/constants/platformConstants";
import { GifPickerProps } from "@/types/chat/types";

const INTERFACE_COMPONENTS = {
  mobile: GifPickerMobile,
  web: GifPickerWeb,
} as const;

type InterfaceComponent = (typeof INTERFACE_COMPONENTS)[keyof typeof INTERFACE_COMPONENTS];

export default function GifPicker(props: GifPickerProps) {
  const isMobileLayout = useIsMobileLayout();

  const mobileSelected = !PLATFORM.IS_WEB || isMobileLayout;

  const SelectedComponent: InterfaceComponent = mobileSelected
    ? INTERFACE_COMPONENTS.mobile
    : INTERFACE_COMPONENTS.web;

  return <SelectedComponent {...props} />;
}
