package com.platform.software.more.seeder.helper;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import com.github.javafaker.Faker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserSeeder {
    Logger logger = LoggerFactory.getLogger(UserSeeder.class);
    private static final Faker faker = new Faker();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public void seedChatUsers() {
        logger.info("started seeding chat users");

        try {
            InputStream inputStream = getClass().getResourceAsStream("/seed-files/users/users.json");
            if (inputStream == null) {
                logger.error("users.json file not found");
                return;
            }
            List<ChatUser> users = objectMapper.readValue(inputStream,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, ChatUser.class));

            userRepository.saveAll(users);
            logger.info("finished seeding chat users: {}", users.size());

        } catch (IOException e) {
            logger.error("error reading users.json file: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("error seeding users: {}", e.getMessage());
        }
    }

    @Transactional
    public void seedGeneratedChatUsers() {
        logger.info("started seeding Generated chat users");

        try {
            List<ChatUser> users = new java.util.ArrayList<>(List.of());

            for (long i = 1; i <= 100; i++) {
                ChatUser user = new ChatUser();
                user.setFirstName(faker.name().firstName());
                user.setLastName(faker.name().lastName());
                user.setUsername(faker.name().username());
                user.setEmail(faker.internet().emailAddress());
                user.setActive(faker.bool().bool());
                user.setDeleted(faker.bool().bool());
                users.add(user);
            }
            userRepository.saveAll(users);
            logger.info("finished seeding Generated chat users: {}", users.size());
        } catch (Exception e) {
            logger.error("error seeding Generated users: {}", e.getMessage());
        }
    }
}