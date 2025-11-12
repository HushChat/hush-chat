package com.platform.software.more.seeder.helper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.software.chat.call.entity.CallParticipant;
import com.platform.software.chat.call.repository.CallParticipantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class CallParticipantSeeder {
    Logger logger = LoggerFactory.getLogger(CallParticipantSeeder.class);

    private final CallParticipantRepository callParticipantRepository;
    private final ObjectMapper objectMapper;

    public CallParticipantSeeder(CallParticipantRepository callParticipantRepository, ObjectMapper objectMapper) {
        this.callParticipantRepository = callParticipantRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void seedCallParticipants() {
        logger.info("started seeding call participants");

        try {
            InputStream inputStream = getClass().getResourceAsStream("/seed-files/calllogs/call-participants.json");
            if (inputStream == null) {
                logger.error("call-participants.json file not found");
                return;
            }
            List<CallParticipant> callParticipants = objectMapper.readValue(inputStream,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, CallParticipant.class));
            callParticipantRepository.saveAll(callParticipants);
            logger.info("finished seeding call participants: {}", callParticipants.size());

        } catch (IOException exception) {
            logger.error("error reading call-participants.json file: {}", exception);
        } catch (Exception exception) {
            logger.error("error seeding call participants: {}", exception);
        }
    }
}
