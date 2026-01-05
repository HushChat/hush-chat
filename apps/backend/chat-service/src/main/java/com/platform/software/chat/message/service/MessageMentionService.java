package com.platform.software.chat.message.service;

import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.entity.MessageMention;
import com.platform.software.chat.message.repository.MessageMentionRepository;
import com.platform.software.chat.user.dto.UserViewDTO;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.repository.UserRepository;
import com.platform.software.common.constants.Constants;
import com.platform.software.exception.CustomInternalServerErrorException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class MessageMentionService {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    // Pattern to match @username only when @ is at word boundary
    // (?<!\S) ensures @ is not preceded by non-whitespace characters
    // This prevents matching emails like user@domain.com
    private final static String USER_MENTION_REGEX = "(?<![\\w.])@(\\S+)";

    private final UserRepository userRepository;
    private final MessageMentionRepository messageMentionRepository;
    private final ConversationUtilService conversationUtilService;

    public MessageMentionService(
            UserRepository userRepository,
            MessageMentionRepository messageMentionRepository,
            ConversationUtilService conversationUtilService
    ) {
        this.userRepository = userRepository;
        this.messageMentionRepository = messageMentionRepository;
        this.conversationUtilService = conversationUtilService;
    }

    /**
     * Save Message with their user mentions
     * @param savedMessage - save message
     * @param messageViewDTO - returns with mentioned user details
     */
    @Transactional
    public void saveMessageMentions(Message savedMessage, MessageViewDTO messageViewDTO) {
        String messageText = savedMessage.getMessageText();

        boolean mentionsAll = constainsMentionAll(messageText);

        List<ChatUser> mentionedUsers = mentionsAll
                ? conversationUtilService.getAllParticipantsExceptSender(
                    messageViewDTO.getConversationId(),
                    messageViewDTO.getSenderId())
                : getMentionedUsersByUsernames(messageText);

        if (mentionedUsers == null || mentionedUsers.isEmpty()) {
            return;
        }

        List<MessageMention> messageMentions = buildMessageMentions(savedMessage, mentionedUsers);

        try {
            messageMentionRepository.saveAll(messageMentions);
        } catch (Exception e) {
            logger.error("cannot save message mentions for message: {}", savedMessage, e);
            throw new CustomInternalServerErrorException("Cannot save message mentions");
        }

        appendMessageMentions(List.of(messageViewDTO));
    }

    public List<ChatUser> getMentionedUsersByUsernames(String messageText) {
        List<String> usernames = extractUsernames(messageText);
        if (usernames.isEmpty()) {
            return List.of();
        }

        return userRepository.findByUsernameIn(usernames);
    }

    private static List<MessageMention> buildMessageMentions(Message savedMessage, List<ChatUser> mentionedUsers) {
        List<MessageMention> messageMentions = mentionedUsers.stream()
            .map(u -> {
                MessageMention messageMention = new MessageMention();
                messageMention.setMentionedUser(u);
                messageMention.setMessage(savedMessage);
                return messageMention;
            })
            .toList();
        return messageMentions;
    }

    private boolean constainsMentionAll(String messageText) {
        return messageText.toLowerCase().contains(Constants.MENTION_ALL);
    }

    /**
     * Append message mentions for the mentioned messages
     * @param messageViewDTOS - requested messages for appending mentions users
     */
    public void appendMessageMentions(List<MessageViewDTO> messageViewDTOS) {
        Set<Long> messageIds = messageViewDTOS.stream()
            .map(MessageViewDTO::getId)
            .collect(Collectors.toSet());

        Map<Long, List<UserViewDTO>> mentionMap = messageMentionRepository.findByMessageIdIn(messageIds)
            .stream()
            .collect(Collectors.groupingBy(
                mention -> mention.getMessage().getId(),
                Collectors.mapping(
                    mention -> new UserViewDTO(mention.getMentionedUser()),
                    Collectors.toList()
                )
            ));

        if (mentionMap.isEmpty()) {
            return;
        }

        messageViewDTOS.forEach(messageViewDTO ->
            messageViewDTO.setMentions(mentionMap.getOrDefault(messageViewDTO.getId(), Collections.emptyList()))
        );
    }

    /**
     * Extracts all @username mentions from a message text
     * @param messageText the text to parse for username mentions
     * @return List of usernames (without the @ symbol)
     */
    public static List<String> extractUsernames(String messageText) {
        List<String> usernames = new ArrayList<>();

        if (messageText == null || messageText.trim().isEmpty()) {
            return usernames;
        }

        Pattern pattern = Pattern.compile(USER_MENTION_REGEX);
        Matcher matcher = pattern.matcher(messageText);

        while (matcher.find()) {
            String username = matcher.group(1); // group(1) gets the username without @
            usernames.add(username);
        }

        return usernames;
    }
}
