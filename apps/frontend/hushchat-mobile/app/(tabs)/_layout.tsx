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

import React from "react";
import { Platform } from "react-native";
import { INavigationItem } from "@/types/navigation/types";
import getTabLayoutByPlatform from "@/components/tab-layouts/TabLayoutFactory";
import useWebSocketConnection from "@/hooks/useWebSocketConnection";

const navigationItems: INavigationItem[] = [
  {
    key: 1,
    name: "conversations",
    route: "/conversations" as const,
    title: "Conversations",
    icon: "chatbox-ellipses",
  },
  {
    key: 3,
    name: "call-history",
    route: "/call-history" as const,
    title: "Calls",
    icon: "call",
  },
  {
    key: 2,
    name: "profile",
    route: "/profile" as const,
    title: "Profile",
    icon: "person-circle",
  },
];

export default function TabLayout() {
  useWebSocketConnection();

  const TabLayout = getTabLayoutByPlatform(Platform.OS);

  return <TabLayout navigationItems={navigationItems} />;
}
