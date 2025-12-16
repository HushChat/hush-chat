import { PLATFORM_NAMES } from "@/constants/platformConstants";
import WebTabLayout from "@/components/tab-layouts/WebTabLayout";
import MobileTabLayout from "@/components/tab-layouts/MobileTabLayout";
import { TabLayoutProps } from "@/types/navigation/types";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

type PlatformValue = (typeof PLATFORM_NAMES)[keyof typeof PLATFORM_NAMES];

export default function getTabLayoutByPlatform(platform: PlatformValue) {
  return function TabLayoutWrapper(props: TabLayoutProps) {
    const isMobileLayout = useIsMobileLayout();

    const shouldRenderMobileUI = platform !== PLATFORM_NAMES.WEB || isMobileLayout;

    const LayoutComponent = shouldRenderMobileUI ? MobileTabLayout : WebTabLayout;
    return <LayoutComponent {...props} />;
  };
}
