package com.platform.software.more.seeder.helper;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.repository.ConversationParticipantRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConversationParticipantSeeder {
    Logger logger = LoggerFactory.getLogger(ConversationParticipantSeeder.class);

    private final ConversationParticipantRepository conversationParticipantRepository;
    private final ObjectMapper objectMapper;

    public ConversationParticipantSeeder(ConversationParticipantRepository conversationParticipantRepository, ObjectMapper objectMapper) {
        this.conversationParticipantRepository  = conversationParticipantRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void seedConversationParticipants() {
        logger.info("started seeding conversation participants");

        try {
            InputStream inputStream = getClass().getResourceAsStream("/seed-files/conversationparticipants/conversation-participants.json");
            if (inputStream == null) {
                logger.error("conversation-participants.json file not found");
                return;
            }
            List<ConversationParticipant> conversationParticipants = objectMapper.readValue(inputStream,
                objectMapper.getTypeFactory().constructCollectionType(List.class, ConversationParticipant.class));
                conversationParticipantRepository.saveAll(conversationParticipants);
                logger.info("finished seeding conversation participants: {}", conversationParticipants.size());

        } catch (IOException e) {
            logger.error("error reading conversation-participants.json file", e);
        } catch (Exception e) {
            logger.error("error seeding conversations: {}", e.getMessage());
        }
    }
}
