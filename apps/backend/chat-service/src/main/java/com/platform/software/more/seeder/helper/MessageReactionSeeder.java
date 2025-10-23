package com.platform.software.more.seeder.helper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.entity.MessageReaction;
import com.platform.software.chat.message.entity.ReactionTypeEnum;
import com.platform.software.chat.message.repository.MessageReactionRepository;
import com.platform.software.chat.message.repository.MessageRepository;
import com.platform.software.chat.user.entity.ChatUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;


@Service
public class MessageReactionSeeder {
    Logger logger = LoggerFactory.getLogger(MessageReactionSeeder.class);

    private static final Random random = new Random();
    private final MessageReactionRepository messageReactionRepository;
    private final ObjectMapper objectMapper;

    private final MessageRepository messageRepository;

    public MessageReactionSeeder(MessageRepository messageRepository, MessageReactionRepository messageReactionRepository, ObjectMapper objectMapper) {
        this.messageRepository = messageRepository;
        this.messageReactionRepository = messageReactionRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void seedGeneratedMessageReactions() {
        logger.info("Started seeding generated message reactions");

        //TODO: Introduce a method to find no of predefined messages and skip those
        List<Message> messages = messageRepository.findAll()
                .stream()
                .filter(m -> m.getId() < 1 || m.getId() > 75)
                .toList();

        if (messages.isEmpty()) {
            logger.warn("No messages found, skipping reaction seeding");
            return;
        }

        List<MessageReaction> reactionsToSave = new ArrayList<>();
        int totalReactions = 0;

        for (Message message : messages) {
            List<ChatUser> participants = getConversationParticipants(message.getConversation());
            if (participants.isEmpty()) {
                continue;
            }

            // 40% chance for a message to have reactions
            if (random.nextDouble() > 0.4) {
                continue;
            }

            List<MessageReaction> messageReactions = createReactionsForMessage(message, participants);
            reactionsToSave.addAll(messageReactions);
            totalReactions += messageReactions.size();

            // Log progress for large datasets
            if (totalReactions % 1000 == 0) {
                logger.info("Generated {} reactions so far...", totalReactions);
            }
        }

        // Batch save all reactions
        if (!reactionsToSave.isEmpty()) {
            messageReactionRepository.saveAll(reactionsToSave);
        }

        logger.info("Finished seeding {} message reactions across {} messages",
            totalReactions, messages.size());
    }

    @Transactional
    public void seedMessageReactions() {
        logger.info("Started seeding predefined Message Reactions");
        try {
            InputStream inputStream = getClass().getResourceAsStream("/seed-files/messages/message-reactions.json");
            if (inputStream == null) {
                logger.error("message-reactions.json file not found");
                return;
            }
            List<MessageReaction> messageReactions = objectMapper.readValue(inputStream,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, MessageReaction.class));
            messageReactionRepository.saveAll(messageReactions);
            logger.info("finished seeding predefined message reactions: {}", messageReactions.size());

        } catch (IOException e) {
            logger.error("error reading message-reactions.json file: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("error seeding message reactions: {}", e.getMessage());
        }
    }

    private List<ChatUser> getConversationParticipants(Conversation conversation) {
        return conversation.getConversationParticipants()
            .stream()
            .map(ConversationParticipant::getUser)
            .collect(Collectors.toList());
    }

    private List<MessageReaction> createReactionsForMessage(Message message, List<ChatUser> participants) {
        List<MessageReaction> reactions = new ArrayList<>();

        // Exclude the sender from reacting to their own message (80% of the time)
        List<ChatUser> potentialReactors = participants.stream()
            .filter(user -> !user.getId().equals(message.getSender().getId()) || random.nextDouble() < 0.2)
            .collect(Collectors.toList());

        if (potentialReactors.isEmpty()) {
            return reactions;
        }

        // Determine number of reactions (1 to min(participants, 6))
        int maxReactions = Math.min(potentialReactors.size(), 6);
        int reactionCount = random.nextInt(maxReactions) + 1;

        // Shuffle participants to get random reactors
        Collections.shuffle(potentialReactors, random);
        List<ChatUser> reactors = potentialReactors.subList(0, reactionCount);

        // Create reactions with weighted distribution
        for (ChatUser reactor : reactors) {
            ReactionTypeEnum reactionType = getWeightedRandomReaction();

            MessageReaction reaction = new MessageReaction();
            reaction.setMessage(message);
            reaction.setUser(reactor);
            reaction.setReactionType(reactionType);

            reactions.add(reaction);
        }

        return reactions;
    }

    private ReactionTypeEnum getWeightedRandomReaction() {
        // Weighted distribution for more realistic reactions
        double rand = random.nextDouble();

        if (rand < 0.35) return ReactionTypeEnum.THUMBS_UP;    // 35% - Most common
        if (rand < 0.60) return ReactionTypeEnum.LOVE;        // 25% - Second most common
        if (rand < 0.75) return ReactionTypeEnum.HAHA;        // 15% - Funny reactions
        if (rand < 0.85) return ReactionTypeEnum.WOW;         // 10% - Surprise
        if (rand < 0.95) return ReactionTypeEnum.SAD;         // 10% - Sympathy
        return ReactionTypeEnum.ANGRY;                        // 5% - Least common
    }
}
