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
import { View } from "react-native";
import classNames from "classnames";
import { PLATFORM } from "@/constants/platformConstants";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";

const COLOR_MUTED = "#9CA3AF";

type DisabledMessageInputProps = {
  userName?: string;
  customMessage?: string;
};

const DisabledMessageInput = ({ customMessage }: DisabledMessageInputProps) => {
  const displayMessage = customMessage || `Messaging is currently unavailable`;

  return (
    <View
      className={classNames(
        "flex-row items-center",
        "bg-background-light dark:bg-background-dark",
        "border-gray-200 dark:border-gray-800",
        PLATFORM.IS_WEB ? "p-4" : "p-3",
      )}
    >
      <View className={classNames("flex-1", PLATFORM.IS_WEB ? "mx-4" : "mx-3")}>
        <View
          className={classNames(
            "flex-row items-center justify-center rounded-3xl",
            "bg-gray-100 dark:bg-gray-800/50",
            "border border-gray-200 dark:border-gray-700",
            PLATFORM.IS_WEB ? "px-6 py-4" : "px-5 py-3",
          )}
          style={{
            minHeight: PLATFORM.IS_WEB ? 48 : 44,
          }}
        >
          <Ionicons
            name="ban"
            size={16}
            color={COLOR_MUTED}
            style={{ marginRight: 8 }}
          />
          <AppText
            className="text-sm text-gray-500 dark:text-gray-400 font-medium"
            style={{ color: COLOR_MUTED }}
          >
            {displayMessage}
          </AppText>
        </View>
      </View>
    </View>
  );
};

export default DisabledMessageInput;
