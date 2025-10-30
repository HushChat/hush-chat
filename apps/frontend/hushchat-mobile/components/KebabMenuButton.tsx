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

import { TouchableOpacity, GestureResponderEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TKebabMenuButtonProps = {
  onPress?: (event: GestureResponderEvent) => void;
  color?: string;
  size?: number;
};

const KebabMenuButton = ({
  onPress,
  color = "#6B7280",
  size = 24,
}: TKebabMenuButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} className="ml-3">
      <Ionicons name="ellipsis-vertical" size={size} color={color} />
    </TouchableOpacity>
  );
};

export default KebabMenuButton;
