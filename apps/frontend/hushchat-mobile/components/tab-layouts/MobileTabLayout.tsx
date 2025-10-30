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

import { TabLayoutProps } from "@/types/navigation/types";
import { Tabs } from "expo-router";
import MobileNavigationInterface from "@/components/tab-layouts/navigations/MobileNavigationInterface";

const MobileTabLayout = (tabLayoutProps: TabLayoutProps) => {
  const { navigationItems } = tabLayoutProps;

  return (
    <Tabs
      tabBar={(props) => (
        <MobileNavigationInterface
          navigationItems={navigationItems}
          {...props}
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      {navigationItems.map((item) => (
        <Tabs.Screen
          key={item.key}
          name={item.name}
          options={{
            title: item.title,
          }}
        />
      ))}
    </Tabs>
  );
};

export default MobileTabLayout;
