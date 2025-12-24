package com.platform.software.chat.conversation.readstatus.service;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.readstatus.dto.ConversationReadInfo;
import com.platform.software.chat.conversation.readstatus.dto.MessageLastSeenRequestDTO;
import com.platform.software.chat.conversation.readstatus.entity.ConversationReadStatus;
import com.platform.software.chat.conversation.readstatus.repository.ConversationReadStatusRepository;
import com.platform.software.chat.conversation.repository.ConversationRepository;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.repository.MessageRepository;
import com.platform.software.chat.message.service.MessageUtilService;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomInternalServerErrorException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConversationReadStatusService {
    Logger logger = LoggerFactory.getLogger(ConversationReadStatusService.class);

    private final ConversationReadStatusRepository conversationReadStatusRepository;
    private final ConversationUtilService conversationUtilService;
    private final MessageUtilService messageUtilService;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;

    public ConversationReadStatusService(
        ConversationReadStatusRepository conversationReadStatusRepository,
        ConversationUtilService conversationUtilService,
        MessageUtilService messageUtilService,
        ConversationRepository conversationRepository,
        MessageRepository messageRepository,
        UserService userService
    ) {
        this.conversationReadStatusRepository = conversationReadStatusRepository;
        this.conversationUtilService = conversationUtilService;
        this.messageUtilService = messageUtilService;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userService = userService;
    }

    @Transactional
    public ConversationReadInfo setConversationLastSeenMessage(Long conversationId, Long loggedInUserId, MessageLastSeenRequestDTO messageLastSeenRequestDTO) {
        ConversationParticipant conversationParticipant = conversationUtilService.getConversationParticipantOrThrow(conversationId, loggedInUserId);
        Message message = messageUtilService.getMessageOrThrow(conversationId, messageLastSeenRequestDTO.getMessageId());

        ConversationReadStatus updatingStatus = getOrCreateReadStatus(conversationParticipant.getConversation(), conversationParticipant.getUser());

        // Early return if the message is already set to avoid unnecessary updates
        if (updatingStatus.getMessage() != null &&
            updatingStatus.getMessage().getId().equals(message.getId())) {
            return conversationReadStatusRepository.findConversationReadInfoByConversationIdAndUserId(
                conversationId,
                loggedInUserId
            );
        }

        updatingStatus.setMessage(message);

        try {
            conversationReadStatusRepository.save(updatingStatus);
        } catch (Exception exception) {
            logger.error("failed set message as read: {}", messageLastSeenRequestDTO.getMessageId(), exception);
            throw new CustomBadRequestException("Failed to mark as read");
        }

        return conversationReadStatusRepository.findConversationReadInfoByConversationIdAndUserId(
            conversationId,
            loggedInUserId
        );
    }

    public Message getLastSeenMessageOrNull(Long conversationId, Long loggedInUserId) {
        return conversationReadStatusRepository.findLastSeenMessageIdByConversationIdAndUserId(conversationId, loggedInUserId)
                .map(lastSeenMessageId -> messageUtilService.getMessageOrThrow(conversationId, lastSeenMessageId))
                .orElse(null);
    }

    @Transactional
    public void markAllConversationsAsRead(Long loggedInUserId) {
        ChatUser loggedInUser = userService.getUserOrThrow(loggedInUserId);
        List<Conversation> conversations = conversationRepository.getAllConversationsForCurrentUser(loggedInUserId);

        List<ConversationReadStatus> conversationReadStatusList = conversations.stream()
                .map(conversation -> {
                    Optional<Message> lastMessageOptional = messageRepository
                            .findTopByConversationIdAndIsUnsendFalseOrderByCreatedAtDesc(
                                    conversation.getId());

                    if (lastMessageOptional.isEmpty()) {
                        return null;
                    }

                    ConversationReadStatus conversationReadStatus = getOrCreateReadStatus(conversation, loggedInUser);
                                        Message lastMessage = lastMessageOptional.get();

                    if (conversationReadStatus.getMessage() != null &&
                        conversationReadStatus.getMessage().getId().equals(lastMessage.getId())) {
                        return null;
                    }
                    conversationReadStatus.setMessage(lastMessage);
                    return conversationReadStatus;
                })
                .filter(Objects::nonNull)
                .toList();

        try {
            conversationReadStatusRepository.saveAll(conversationReadStatusList);
        } catch (Exception e) {
            logger.error("failed to mark conversations as read for user {}: {}", loggedInUserId, e.getMessage(), e);
            throw new CustomInternalServerErrorException("Unable to update conversation read status", e);
        }
    }

    @Transactional
    public void markConversationAsRead(Long loggedInUserId, Long conversationId) {
        ChatUser loggedInUser = userService.getUserOrThrow(loggedInUserId);
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        Optional<Message> lastMessageOpt = messageRepository
                .findTopByConversationIdAndIsUnsendFalseOrderByCreatedAtDesc(conversationId);

        if (lastMessageOpt.isEmpty()) {
            return;
        }

        ConversationReadStatus conversationReadStatus = getOrCreateReadStatus(conversation, loggedInUser);
        Message lastMessage = lastMessageOpt.get();

        if (conversationReadStatus.getMessage() != null &&
            conversationReadStatus.getMessage().getId().equals(lastMessage.getId())) {
            return;
        }

        conversationReadStatus.setMessage(lastMessage);
        conversationReadStatusRepository.save(conversationReadStatus);
    }

    private ConversationReadStatus getOrCreateReadStatus(Conversation conversation, ChatUser user) {
        return conversationReadStatusRepository
                .findByConversationIdAndUserId(conversation.getId(), user.getId())
                .orElseGet(() -> {
                    ConversationReadStatus newReadStatus = new ConversationReadStatus();
                    newReadStatus.setConversation(conversation);
                    newReadStatus.setUser(user);
                    return newReadStatus;
                });
    }
}

