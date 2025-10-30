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

import React, { memo } from "react";
import { View } from "react-native";
import classNames from "classnames";
import { IMessage } from "@/types/chat/types";
import { AppText } from "@/components/AppText";

interface ParentMessagePreviewProps {
  message: IMessage;
  parentMessage: IMessage;
  currentUserId: string;
}

const ParentMessagePreview = memo<ParentMessagePreviewProps>(
  ({ message, parentMessage, currentUserId }) => {
    const isCurrentUser = message.senderId === Number(currentUserId);
    return (
      <View
        className={classNames(
          "max-w-[75%] border-l-4 px-3 py-2 rounded-md mb-2",
          isCurrentUser
            ? "self-end border-primary-light bg-secondary-light dark:border-primary-dark dark:bg-secondary-dark"
            : "self-start border-primary-dark bg-secondary-light dark:border-primary-light dark:bg-secondary-dark",
        )}
      >
        <AppText
          className={classNames(
            "text-xs font-semibold mb-1",
            isCurrentUser
              ? "text-primary-light text-right"
              : "text-primary-dark dark:text-primary-light text-left",
          )}
        >
          {message.senderId === Number(currentUserId) &&
          parentMessage?.senderId === Number(currentUserId)
            ? "Replying to myself"
            : message.senderId !== Number(currentUserId) &&
                parentMessage?.senderId === Number(currentUserId)
              ? "Replying to me"
              : `Replying to ${parentMessage?.senderFirstName}`}
        </AppText>
        <AppText
          className={classNames(
            "text-sm",
            isCurrentUser
              ? "text-text-primary-light dark:text-text-primary-dark text-right"
              : "text-text-primary-light dark:text-text-primary-dark text-left",
          )}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {parentMessage.messageText}
        </AppText>
      </View>
    );
  },
);

ParentMessagePreview.displayName = "ParentMessagePreview";
export default ParentMessagePreview;
