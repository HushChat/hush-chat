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
