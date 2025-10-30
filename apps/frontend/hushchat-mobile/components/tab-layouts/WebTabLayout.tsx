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
import { View } from "react-native";
import WebNavigationInterface from "@/components/tab-layouts/navigations/WebNavigationInterface";
import { Stack } from "expo-router";

const WebTabLayout = (tabLayoutProps: TabLayoutProps) => {
  const { navigationItems } = tabLayoutProps;

  return (
    <View className="flex-1">
      <WebNavigationInterface navigationItems={navigationItems} />
      <View className="flex-1" style={{ marginLeft: 80 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          {navigationItems.map((item) => (
            <Stack.Screen key={item.key} name={item.name} />
          ))}
        </Stack>
      </View>
    </View>
  );
};

export default WebTabLayout;
