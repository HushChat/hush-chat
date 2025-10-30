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

import { TouchableOpacity } from "react-native";
import React from "react";
import classNames from "classnames";
import { DEFAULT_HIT_SLOP } from "@/constants/ui";
import { AppText } from "@/components/AppText";

interface FilterButtonProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
}

const FilterButton = ({
  label,
  isActive = false,
  onPress,
}: FilterButtonProps) => {
  return (
    <TouchableOpacity
      className={classNames("px-4 py-2 rounded-full", {
        "bg-blue-100 dark:bg-[#162446] border border-primary-light dark:border-primary-dark":
          isActive,
        "bg-gray-100 dark:bg-gray-800": !isActive,
      })}
      hitSlop={DEFAULT_HIT_SLOP}
      onPress={onPress}
    >
      <AppText
        className={classNames("font-medium", {
          "text-primary-light dark:text-text-primary-dark": isActive,
          "text-gray-600 dark:text-text-secondary-dark": !isActive,
        })}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

export default FilterButton;
