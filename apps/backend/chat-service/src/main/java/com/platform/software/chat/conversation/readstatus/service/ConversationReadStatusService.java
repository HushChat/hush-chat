package com.platform.software.chat.conversation.readstatus.service;

import com.platform.software.chat.conversation.readstatus.dto.ConversationReadInfo;
import com.platform.software.chat.conversation.readstatus.dto.MessageLastSeenRequestDTO;
import com.platform.software.chat.conversation.readstatus.entity.ConversationReadStatus;
import com.platform.software.chat.conversation.readstatus.repository.ConversationReadStatusRepository;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.service.MessageUtilService;
import com.platform.software.exception.CustomBadRequestException;
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

    public ConversationReadStatusService(
        ConversationReadStatusRepository conversationReadStatusRepository,
        ConversationUtilService conversationUtilService,
        MessageUtilService messageUtilService
    ) {
        this.conversationReadStatusRepository = conversationReadStatusRepository;
        this.conversationUtilService = conversationUtilService;
        this.messageUtilService = messageUtilService;
    }

    @Transactional
    public ConversationReadInfo setConversationLastSeenMessage(Long conversationId, Long loggedInUserId, MessageLastSeenRequestDTO messageLastSeenRequestDTO) {
        ConversationParticipant conversationParticipant = conversationUtilService.getConversationParticipantOrThrow(conversationId, loggedInUserId);
        Message message = messageUtilService.getMessageOrThrow(conversationId, messageLastSeenRequestDTO.getMessageId());

        ConversationReadStatus updatingStatus = conversationReadStatusRepository
            .findByConversationIdAndUserId(conversationId, loggedInUserId)
            .orElseGet(() -> {
                ConversationReadStatus newStatus = new ConversationReadStatus();
                newStatus.setUser(conversationParticipant.getUser());
                newStatus.setConversation(conversationParticipant.getConversation());
                return newStatus;
            });

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
}

