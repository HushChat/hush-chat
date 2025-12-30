package com.platform.software.more.seeder.helper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.software.chat.user.entity.ChatUserInfo;
import com.platform.software.chat.user.repository.UserBlockRepository;
import com.platform.software.chat.user.repository.UserInfoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class UserInfoSeeder {
    Logger logger = LoggerFactory.getLogger(UserSeeder.class);

    @Autowired
    private UserInfoRepository userInfoRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public void seedChatUserInfo() {
        logger.info("started seeding chat user info");

        try {
            InputStream inputStream = getClass().getResourceAsStream("/seed-files/users/userInfo.json");
            if (inputStream == null) {
                logger.error("userInfo.json file not found");
                return;
            }
            List<ChatUserInfo> userInfo = objectMapper.readValue(inputStream,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, ChatUserInfo.class));

            userInfoRepository.saveAll(userInfo);
            logger.info("finished seeding chat user info: {}", userInfo.size());

        } catch (IOException e) {
            logger.error("error reading userInfo.json file: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("error seeding user info: {}", e.getMessage());
        }
    }
}