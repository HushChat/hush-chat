/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { PLATFORM_NAMES } from "@/constants/platformConstants";
import WebTabLayout from "@/components/tab-layouts/WebTabLayout";
import MobileTabLayout from "@/components/tab-layouts/MobileTabLayout";
import { TabLayoutProps } from "@/types/navigation/types";

type PlatformValue = (typeof PLATFORM_NAMES)[keyof typeof PLATFORM_NAMES];

const tabLayoutsFactory: Partial<
  Record<PlatformValue, (props: TabLayoutProps) => JSX.Element>
> & {
  default: (props: TabLayoutProps) => JSX.Element;
} = {
  [PLATFORM_NAMES.WEB]: (props: TabLayoutProps) => <WebTabLayout {...props} />,
  default: (props: TabLayoutProps) => <MobileTabLayout {...props} />,
};

const getTabLayoutByPlatform = (platform: PlatformValue) => {
  return tabLayoutsFactory[platform] || tabLayoutsFactory.default;
};

export default getTabLayoutByPlatform;
