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

import { Text, View } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

export const ForwardedLabel = ({
  isForwardedMessage,
  isCurrentUser,
}: {
  isForwardedMessage: boolean;
  isCurrentUser: boolean;
}) => {
  if (!isForwardedMessage) return null;

  return (
    <View
      className={classNames(
        "flex-row items-center gap-1 mb-1",
        isCurrentUser ? "self-end" : "self-start",
      )}
    >
      <Ionicons
        name="arrow-redo-outline"
        size={12}
        className={classNames(
          isCurrentUser ? "text-primary-light" : "text-gray-500",
        )}
      />
      <Text
        className={classNames(
          "text-xs italic",
          isCurrentUser
            ? "text-primary-light"
            : "text-gray-500 dark:text-gray-400",
        )}
        style={{ fontStyle: "italic" }}
      >
        Forwarded
      </Text>
    </View>
  );
};
