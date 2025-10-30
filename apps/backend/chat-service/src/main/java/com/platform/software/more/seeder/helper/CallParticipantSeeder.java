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

package com.platform.software.more.seeder.helper;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.software.chat.call.entity.CallParticipant;
import com.platform.software.chat.call.repository.CallParticipantRepository;
import org.springframework.transaction.annotation.Transactional;

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
