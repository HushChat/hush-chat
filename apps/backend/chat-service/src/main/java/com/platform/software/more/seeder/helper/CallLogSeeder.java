package com.platform.software.more.seeder.helper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.software.chat.call.entity.CallLog;
import com.platform.software.chat.call.repository.CallLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

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
