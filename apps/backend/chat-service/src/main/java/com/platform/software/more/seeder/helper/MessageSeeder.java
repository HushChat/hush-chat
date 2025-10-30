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

import com.github.javafaker.Faker;
import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.repository.ConversationRepository;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.repository.MessageRepository;
import com.platform.software.chat.user.entity.ChatUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class MessageSeeder {
    Logger logger = LoggerFactory.getLogger(MessageSeeder.class);
    private static final Faker faker = new Faker();
    private static final Random random = new Random();

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ObjectMapper objectMapper;

    public MessageSeeder(MessageRepository messageRepository, ConversationRepository conversationRepository, ObjectMapper objectMapper) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void seedGeneratedMessages() {
        logger.info("Started seeding messages");

        List<Conversation> conversations = conversationRepository.findAll();

        int totalMessages = 0;

        for (Conversation conversation : conversations.reversed()) {
            List<Message> messagesToSave = new ArrayList<>();
            int messageCount = random.nextInt(51); // 0 to 50 messages
            if (messageCount == 0) {
                continue; // Skip if no messages to create
            }

            List<ChatUser> participants = getConversationParticipants(conversation);
            if (participants.isEmpty()) {
                logger.warn("No participants found for conversation {}, skipping", conversation.getId());
                continue;
            }

            List<Message> conversationMessages = createMessagesForConversation(
                conversation, participants, messageCount);
            messagesToSave.addAll(conversationMessages);
            totalMessages += messageCount;

            // Log progress for large datasets
            if (totalMessages % 1000 == 0) {
                logger.info("Generated {} messages so far...", totalMessages);
            }

            if (conversation.getId() <= 5) {
                messagesToSave.forEach(messageRepository::saveMessageWthSearchVector); // 1. seed messages with search vector
            } else {
                messageRepository.saveAll(conversationMessages); // 2. seed messages WITHOUT search vector (faster)
            }
        }
        logger.info("Finished seeding {} messages across {} conversations",
            totalMessages, conversations.size());
    }

    @Transactional
    public void seedMessages() {
        logger.info("Started seeding predefined Messages");
        try {
            InputStream inputStream = getClass().getResourceAsStream("/seed-files/messages/messages.json");
            if (inputStream == null) {
                logger.error("messages.json file not found");
                return;
            }
            List<Message> messages = objectMapper.readValue(inputStream,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Message.class));
            messages.forEach(messageRepository::saveMessageWthSearchVector);

            logger.info("finished seeding predefined messages: {}", messages.size());

        } catch (IOException e) {
            logger.error("error reading messages.json file", e);
        } catch (Exception e) {
            logger.error("error seeding messages", e);
        }
    }

    private List<ChatUser> getConversationParticipants(Conversation conversation) {
        return conversation.getConversationParticipants()
            .stream()
            .map(ConversationParticipant::getUser)
            .collect(Collectors.toList());
    }

    private List<Message> createMessagesForConversation(Conversation conversation,
                                                        List<ChatUser> participants,
                                                        int messageCount) {
        List<Message> messages = new ArrayList<>();
        List<Message> availableForReply = new ArrayList<>();

        for (int i = 0; i < messageCount; i++) {
            ChatUser sender = participants.get(random.nextInt(participants.size()));
            Message message = createMessage(conversation, sender, availableForReply);

            messages.add(message);
            availableForReply.add(message);

            // Limit available messages for replies to prevent deep nesting
            if (availableForReply.size() > 10) {
                availableForReply.remove(0);
            }
        }

        return messages;
    }

    private Message createMessage(Conversation conversation, ChatUser sender, List<Message> availableForReply) {
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setMessageText(generateRandomMessageText());

        // 60% chance to be a reply if replies are available
        if (!availableForReply.isEmpty() && random.nextDouble() < 0.6) {
            Message parentMessage = availableForReply.get(random.nextInt(availableForReply.size()));
            message.setParentMessage(parentMessage);
        }

        // 20% chance to be a forwarded message if messages are available
        if (!availableForReply.isEmpty() && random.nextDouble() < 0.2) {
            Message forwardedMessage = availableForReply.get(random.nextInt(availableForReply.size()));
            message.setForwardedMessage(forwardedMessage);
            message.setMessageText("Forwarded: " + forwardedMessage.getMessageText());
        }

        return message;
    }

    private String generateRandomMessageText() {
        String[] messageTypes = {
            faker.lorem().sentence(),
            faker.chuckNorris().fact(),
            faker.shakespeare().hamletQuote(),
            faker.rickAndMorty().quote(),
            faker.howIMetYourMother().quote(),
            faker.gameOfThrones().quote(),
            faker.lebowski().quote(),
            faker.yoda().quote(),
            faker.harryPotter().quote(),
            faker.starTrek().location() + " " + faker.starTrek().character(),
            faker.programmingLanguage().name() + " is " + faker.hacker().adjective(),
            faker.company().catchPhrase(),
            "Meeting at " + faker.date().future(7, TimeUnit.DAYS),
            faker.weather().description() + " today!",
            faker.music().genre() + " music is the best",
            faker.food().dish() + " for lunch?",
            faker.color().name() + " is my favorite color",
            faker.book().title() + " - great read!"
        };

        return messageTypes[random.nextInt(messageTypes.length)];
    }
}
