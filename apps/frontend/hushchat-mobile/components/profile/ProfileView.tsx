import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import { PLATFORM } from "@/constants/platformConstants";
import { ProfileMobile } from "@/components/profile/views/ProfileMobile";
import { ProfileWeb } from "@/components/profile/views/ProfileWeb";

const INTERFACE_COMPONENTS = {
  mobile: ProfileMobile,
  web: ProfileWeb,
} as const;

type InterfaceComponent = (typeof INTERFACE_COMPONENTS)[keyof typeof INTERFACE_COMPONENTS];

export const ProfileView = () => {
  const isMobileLayout = useIsMobileLayout();

  const mobileSelected = !PLATFORM.IS_WEB || isMobileLayout;

  const SelectedComponent: InterfaceComponent = mobileSelected
    ? INTERFACE_COMPONENTS.mobile
    : INTERFACE_COMPONENTS.web;

  return <SelectedComponent />;
};
