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
import com.platform.software.chat.call.entity.CallLog;
import com.platform.software.chat.call.repository.CallLogRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CallLogSeeder {
    Logger logger = LoggerFactory.getLogger(CallLogSeeder.class);

    private final CallLogRepository callLogRepository;
    private final ObjectMapper objectMapper;

    public CallLogSeeder(CallLogRepository callLogRepository, ObjectMapper objectMapper) {
        this.callLogRepository = callLogRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void seedCallLogs() {
        logger.info("started seeding call logs");

        try {
            InputStream inputStream = getClass().getResourceAsStream("/seed-files/calllogs/call-logs.json");
            if (inputStream == null) {
                logger.error("call-logs.json file not found");
                return;
            }
            List<CallLog> callLogs = objectMapper.readValue(inputStream,
                objectMapper.getTypeFactory().constructCollectionType(List.class, CallLog.class));
            callLogRepository.saveAll(callLogs);
            logger.info("finished seeding call logs: {}", callLogs.size());

        } catch (IOException exception) {
            logger.error("error reading call-logs.json file", exception);
        } catch (Exception exception) {
            logger.error("error seeding call logs: {}", exception);
        }
    }
}
