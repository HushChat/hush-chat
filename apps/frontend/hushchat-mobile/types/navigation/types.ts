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

import { Ionicons } from "@expo/vector-icons";
import { Href } from "expo-router";
interface INavigationItem {
  key: number;
  name: string;
  route: Href;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface TabLayoutProps {
  navigationItems: INavigationItem[];
}

export { INavigationItem, TabLayoutProps };
