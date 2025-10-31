package com.platform.software.more.seeder.helper;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.message.entity.FavouriteMessage;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.repository.FavoriteMessageRepository;
import com.platform.software.chat.message.repository.MessageRepository;
import com.platform.software.chat.user.entity.ChatUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class FavouriteMessageSeeder {
    Logger logger = LoggerFactory.getLogger(FavouriteMessageSeeder.class);
    private static final Random random = new Random();
    private final FavoriteMessageRepository favoriteMessageRepository;

    private final MessageRepository messageRepository;

    public FavouriteMessageSeeder(MessageRepository messageRepository, FavoriteMessageRepository favoriteMessageRepository) {
        this.messageRepository = messageRepository;
        this.favoriteMessageRepository = favoriteMessageRepository;
    }

    @Transactional
    public void seedFavouriteMessages() {
        logger.info("Started seeding favourite messages");

        List<Message> messages = messageRepository.findAll();
        if (messages.isEmpty()) {
            logger.warn("No messages found, skipping favourite message seeding");
            return;
        }

        List<FavouriteMessage> favouritesToSave = new ArrayList<>();
        int totalFavourites = 0;

        for (Message message : messages) {
            List<ChatUser> participants = getConversationParticipants(message.getConversation());
            if (participants.isEmpty()) {
                continue;
            }

            // 15% chance for a message to be favourited by someone
            if (random.nextDouble() > 0.15) {
                continue;
            }

            List<FavouriteMessage> messageFavourites = createFavouritesForMessage(message, participants);
            favouritesToSave.addAll(messageFavourites);
            totalFavourites += messageFavourites.size();

            // Log progress for large datasets
            if (totalFavourites % 500 == 0) {
                logger.info("Generated {} favourites so far...", totalFavourites);
            }
        }

        // Batch save all favourites
        if (!favouritesToSave.isEmpty()) {
            favoriteMessageRepository.saveAll(favouritesToSave);
        }

        logger.info("Finished seeding {} favourite messages across {} messages",
            totalFavourites, messages.size());
    }

    private List<ChatUser> getConversationParticipants(Conversation conversation) {
        return conversation.getConversationParticipants()
            .stream()
            .map(ConversationParticipant::getUser)
            .collect(Collectors.toList());
    }

    private List<FavouriteMessage> createFavouritesForMessage(Message message, List<ChatUser> participants) {
        List<FavouriteMessage> favourites = new ArrayList<>();

        // Users can favourite their own messages (some people do this for bookmarking)
        List<ChatUser> potentialFavouriters = new ArrayList<>(participants);

        if (potentialFavouriters.isEmpty()) {
            return favourites;
        }

        // Determine number of favourites based on message characteristics
        int maxFavourites = calculateMaxFavourites(message, potentialFavouriters.size());
        int favouriteCount = random.nextInt(maxFavourites) + 1;

        // Shuffle participants to get random favouriters
        Collections.shuffle(potentialFavouriters, random);
        List<ChatUser> favouriters = potentialFavouriters.subList(0,
            Math.min(favouriteCount, potentialFavouriters.size()));

        // Create favourites
        for (ChatUser favouriter : favouriters) {
            FavouriteMessage favourite = new FavouriteMessage();
            favourite.setMessage(message);
            favourite.setUser(favouriter);

            favourites.add(favourite);
        }

        return favourites;
    }

    private int calculateMaxFavourites(Message message, int participantCount) {
        String messageText = message.getMessageText().toLowerCase();

        // Base max favourites (10-30% of participants)
        int baseMax = Math.max(1, (int) (participantCount * (0.1 + random.nextDouble() * 0.2)));

        // Increase likelihood for certain message types
        if (isImportantMessage(messageText)) {
            return Math.min(participantCount, baseMax + 2); // Important messages get more favourites
        }

        if (isInformationalMessage(messageText)) {
            return Math.min(participantCount, baseMax + 1); // Info messages get slightly more
        }

        return Math.min(participantCount, baseMax);
    }

    private boolean isImportantMessage(String messageText) {
        return containsAny(messageText,
            "important", "urgent", "deadline", "meeting", "announcement",
            "reminder", "action required", "please", "asap", "priority",
            "schedule", "appointment", "conference", "project", "milestone"
        );
    }

    private boolean isInformationalMessage(String messageText) {
        return containsAny(messageText,
            "info", "update", "news", "link", "http", "document", "file",
            "report", "summary", "guide", "tutorial", "how to", "instructions",
            "location", "address", "phone", "email", "contact"
        );
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    // Alternative method for user-specific favouriting patterns
    private List<FavouriteMessage> createPersonalizedFavourites(Message message, List<ChatUser> participants) {
        List<FavouriteMessage> favourites = new ArrayList<>();

        for (ChatUser participant : participants) {
            // Each user has individual probability to favourite based on "personality"
            double favouriteChance = getUserFavouritePersonality(participant.getId());

            if (random.nextDouble() < favouriteChance) {
                // Additional checks for message relevance
                if (isMessageRelevantToUser(message, participant)) {
                    FavouriteMessage favourite = new FavouriteMessage();
                    favourite.setMessage(message);
                    favourite.setUser(participant);
                    favourites.add(favourite);
                }
            }
        }

        return favourites;
    }

    private double getUserFavouritePersonality(Long userId) {
        // Create consistent "personality" based on user ID
        Random userRandom = new Random(userId.hashCode());

        // Some users favourite more (collectors), others rarely favourite
        double[] personalities = {0.02, 0.05, 0.08, 0.12, 0.18, 0.25}; // 2% to 25% chance
        return personalities[userRandom.nextInt(personalities.length)];
    }

    private boolean isMessageRelevantToUser(Message message, ChatUser user) {
        String messageText = message.getMessageText().toLowerCase();

        // Higher chance to favourite if:
        // 1. Message mentions their name
        if (messageText.contains(user.getFirstName().toLowerCase()) ||
            messageText.contains(user.getLastName().toLowerCase())) {
            return random.nextDouble() < 0.8; // 80% chance
        }

        // 2. Important/informational messages
        if (isImportantMessage(messageText) || isInformationalMessage(messageText)) {
            return random.nextDouble() < 0.4; // 40% chance
        }

        // 3. Messages they sent (bookmarking own messages)
        if (message.getSender().getId().equals(user.getId())) {
            return random.nextDouble() < 0.3; // 30% chance
        }

        // 4. Random baseline
        return random.nextDouble() < 0.1; // 10% chance for other messages
    }
}
