import { PLATFORM_NAMES } from '@/constants/platformConstants';
import WebTabLayout from '@/components/tab-layouts/WebTabLayout';
import MobileTabLayout from '@/components/tab-layouts/MobileTabLayout';
import { TabLayoutProps } from '@/types/navigation/types';

type PlatformValue = (typeof PLATFORM_NAMES)[keyof typeof PLATFORM_NAMES];

const tabLayoutsFactory: Partial<Record<PlatformValue, (props: TabLayoutProps) => JSX.Element>> & {
  default: (props: TabLayoutProps) => JSX.Element;
} = {
  [PLATFORM_NAMES.WEB]: (props: TabLayoutProps) => <WebTabLayout {...props} />,
  default: (props: TabLayoutProps) => <MobileTabLayout {...props} />,
};

const getTabLayoutByPlatform = (platform: PlatformValue) => {
  return tabLayoutsFactory[platform] || tabLayoutsFactory.default;
};

export default getTabLayoutByPlatform;
