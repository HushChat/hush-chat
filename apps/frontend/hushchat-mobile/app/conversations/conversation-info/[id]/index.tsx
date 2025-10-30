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

/**
 * ConversationIdRoute
 *
 * Web route handler for displaying conversation info by its ID.
 * - Reads the conversation ID from the URL using `useLocalSearchParams`.
 * - Redirects back to the chats screen if no ID is provided.
 * - Renders the conversation details through component.
 *
 * This acts as the placeholder route for the conversation info sidebar/panel
 * in the web layout of the chat application.
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import ConversationInfoPanel from "@/components/conversations/conversation-info-panel/ConversationInfoPanel";
import { useEffect } from "react";
import { CHATS_PATH } from "@/constants/routes";

export default function ConversationIdRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.replace(CHATS_PATH);
    }
  }, [id, router]);

  return <ConversationInfoPanel conversationId={+id} />;
}
