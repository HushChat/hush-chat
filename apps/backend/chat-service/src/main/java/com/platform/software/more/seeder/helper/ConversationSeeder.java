package com.platform.software.more.seeder.helper;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.javafaker.Faker;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum;
import com.platform.software.chat.conversationparticipant.repository.ConversationParticipantRepository;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.repository.ConversationRepository;

@Service
public class ConversationSeeder {
    private static final Logger logger = LoggerFactory.getLogger(ConversationSeeder.class);
    private static final Faker faker = new Faker();
    private static final Random random = new Random();
    private final ObjectMapper objectMapper;
    private final ConversationParticipantRepository conversationParticipantRepository;

    @Value("${chat.default.dev-user}")
    private String devUser;

    private static final int CONVERSATIONS_WITH_USER = 50;
    private static final int RANDOM_CONVERSATIONS = 50;

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public ConversationSeeder(ConversationRepository conversationRepository, UserRepository userRepository, ObjectMapper objectMapper, ConversationParticipantRepository conversationParticipantRepository) {
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.conversationParticipantRepository = conversationParticipantRepository;
    }

    private List<ChatUser> getRandomUsers(List<ChatUser> chatUsers, int maxCount) {
        int randomCount = random.nextInt(Math.min(maxCount, chatUsers.size())) + 1;
        List<ChatUser> shuffled = new ArrayList<>(chatUsers);
        Collections.shuffle(shuffled, random);
        return shuffled.subList(0, randomCount);
    }

    private List<ChatUser> removeDuplicateUsers(List<ChatUser> participants) {
        return participants.stream()
            .collect(Collectors.toMap(
                ChatUser::getId,
                Function.identity(),
                (existing, replacement) -> existing,
                LinkedHashMap::new))
            .values()
            .stream()
            .toList();
    }

    private ConversationParticipant createParticipant(ChatUser user, ConversationParticipantRoleEnum role) {
        ConversationParticipant participant = new ConversationParticipant();
        participant.setUser(user);
        participant.setRole(role);
        return participant;
    }

    private ConversationParticipant createRandomRoleParticipant(ChatUser user) {
        ConversationParticipantRoleEnum role = random.nextBoolean()
            ? ConversationParticipantRoleEnum.ADMIN
            : ConversationParticipantRoleEnum.MEMBER;
        return createParticipant(user, role);
    }

    private Conversation createGroupConversation(ChatUser createdBy, List<ChatUser> participants) {
        Conversation conversation = new Conversation();
        conversation.setIsGroup(true);
        conversation.setCreatedBy(createdBy);
        conversation.setName(faker.company().buzzword() + " " + faker.hacker().noun());

        List<ConversationParticipant> conversationParticipants = participants.stream()
            .map(this::createRandomRoleParticipant)
            .collect(Collectors.toList());

        conversation.setConversationParticipants(conversationParticipants);
        return conversation;
    }

    private Conversation createDirectConversation(ChatUser createdBy, ChatUser otherUser) {
        Conversation conversation = new Conversation();
        conversation.setIsGroup(false);
        conversation.setCreatedBy(createdBy);

        List<ConversationParticipant> participants = Arrays.asList(
            createParticipant(otherUser, ConversationParticipantRoleEnum.MEMBER)
        );
        conversation.setConversationParticipants(participants);
        return conversation;
    }

    private ChatUser getRandomUserExcluding(List<ChatUser> chatUsers, Long excludeUserId) {
        ChatUser selectedUser;
        do {
            selectedUser = chatUsers.get(random.nextInt(chatUsers.size()));
        } while (selectedUser.getId().equals(excludeUserId));
        return selectedUser;
    }

    private List<ChatUser> ensureUsersIncluded(List<ChatUser> participants, ChatUser... usersToInclude) {
        Set<ChatUser> participantSet = new HashSet<>(participants);
        for (ChatUser user : usersToInclude) {
            participantSet.add(user);
        }
        return new ArrayList<>(participantSet);
    }

    private Conversation createConversationWithLoggedInUser(List<ChatUser> chatUsers, ChatUser loggedInUser) {
        ChatUser createdBy = chatUsers.get(random.nextInt(chatUsers.size()));
        boolean isGroup = faker.bool().bool();

        if (isGroup) {
            List<ChatUser> participants = getRandomUsers(chatUsers, chatUsers.size());
            participants = ensureUsersIncluded(participants, loggedInUser, createdBy);
            participants = removeDuplicateUsers(participants);
            return createGroupConversation(createdBy, participants);
        } else {
            ChatUser otherUser = createdBy.getId().equals(loggedInUser.getId())
                ? loggedInUser
                : getRandomUserExcluding(chatUsers, loggedInUser.getId());

            Conversation conversation = createDirectConversation(createdBy, otherUser);

            // For direct conversations, ensure logged-in user is always a participant
            if (!otherUser.getId().equals(loggedInUser.getId())) {
                List<ConversationParticipant> participants = new ArrayList<>(conversation.getConversationParticipants());
                participants.add(createParticipant(loggedInUser, ConversationParticipantRoleEnum.MEMBER));
                conversation.setConversationParticipants(participants);
            }

            return conversation;
        }
    }

    private Conversation createRandomConversation(List<ChatUser> chatUsers) {
        ChatUser createdBy = chatUsers.get(random.nextInt(chatUsers.size()));
        boolean isGroup = faker.bool().bool();

        if (isGroup) {
            List<ChatUser> participants = getRandomUsers(chatUsers, chatUsers.size());
            participants = ensureUsersIncluded(participants, createdBy);
            participants = removeDuplicateUsers(participants);
            return createGroupConversation(createdBy, participants);
        } else {
            ChatUser otherUser = getRandomUserExcluding(chatUsers, createdBy.getId());
            return createDirectConversation(createdBy, otherUser);
        }
    }

    @Transactional
    public void seedConversationsAndParticipants() {
        logger.info("Started seeding conversations");

        try {
            InputStream inputStream = getClass().getResourceAsStream("/seed-files/conversations/conversations.json");
            if (inputStream == null) {
                logger.error("conversations.json file not found");
                return;
            }
            List<Conversation> conversations = objectMapper.readValue(inputStream,
                objectMapper.getTypeFactory().constructCollectionType(List.class, Conversation.class));
            conversationRepository.saveAll(conversations);
            logger.info("finished seeding conversations: {}", conversations.size());

        } catch (IOException e) {
            logger.error("error reading conversations.json file", e);
        } catch (Exception e) {
            logger.error("error seeding conversations", e);
        }

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

    @Transactional
    public void seedGeneratedConversationsAndParticipants(){
        logger.info("Started seeding Generated conversations");

        List<ChatUser> chatUsers = userRepository.getAllUsersIgnoringFilters();
        if (chatUsers.isEmpty()) {
            logger.warn("No users found, skipping conversation seeding");
            return;
        }

        ChatUser loggedInUser = userRepository.findByEmail(devUser)
                .orElseThrow(() -> new IllegalStateException("Default dev user not found"));

        List<Conversation> conversationsToSave = new ArrayList<>();

        // Create conversations with logged-in user
        logger.info("Creating {} conversations with logged-in user as participant", CONVERSATIONS_WITH_USER);
        for (int i = 0; i < CONVERSATIONS_WITH_USER; i++) {
            conversationsToSave.add(createConversationWithLoggedInUser(chatUsers, loggedInUser));
        }

        // Create random conversations
        logger.info("Creating {} random conversations", RANDOM_CONVERSATIONS);
        for (int i = 0; i < RANDOM_CONVERSATIONS; i++) {
            conversationsToSave.add(createRandomConversation(chatUsers));
        }

        // Batch save for better performance
        conversationRepository.saveAll(conversationsToSave);

        logger.info("Finished seeding {} conversations ({} with logged-in user ID: {}, {} random)",
                conversationsToSave.size(), CONVERSATIONS_WITH_USER, loggedInUser.getId(), RANDOM_CONVERSATIONS);
    }
}