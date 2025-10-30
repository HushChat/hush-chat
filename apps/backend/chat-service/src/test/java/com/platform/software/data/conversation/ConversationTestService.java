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

package com.platform.software.data.conversation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.exception.CustomBadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;

@Service
public class ConversationTestService {

    @Autowired
    private ObjectMapper objectMapper;

    List<ConversationParticipant> getSeededConversationParticipants(Long groupConversationId) {
        try {
            InputStream inputStream = getClass().getResourceAsStream("/seed-files/conversationparticipants/conversation-participants.json");
            if (inputStream == null) {
                throw new CustomBadRequestException("conversation-participants.json file not found");
            }

            List<ConversationParticipant> allConversationParticipants = objectMapper.readValue(inputStream,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, ConversationParticipant.class));

            return allConversationParticipants.stream()
                    .filter(cp -> cp.getConversation().getId().equals(groupConversationId)).toList();

        } catch (Exception e) {
            throw new CustomBadRequestException("error reading conversation-participants.json file", e);
        }
    }
}
