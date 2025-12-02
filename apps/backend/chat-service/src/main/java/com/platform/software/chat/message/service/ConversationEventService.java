package com.platform.software.chat.message.service;

import com.platform.software.chat.conversation.dto.ConversationEventType;
import com.platform.software.chat.conversation.entity.ConversationEvent;
import com.platform.software.chat.conversation.repository.ConversationEventRepository;
import com.platform.software.chat.conversationparticipant.repository.ConversationParticipantRepository;
import com.platform.software.chat.message.dto.MessageTypeEnum;
import com.platform.software.chat.message.dto.MessageUpsertDTO;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.repository.UserRepository;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.exception.CustomInternalServerErrorException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationEventService {
    private final Logger logger = LoggerFactory.getLogger(ConversationEventService.class);

    private final UserService userService;
    private final ConversationParticipantRepository conversationParticipantRepository;
    private final ConversationEventRepository conversationEventRepository;
    private final UserRepository userRepository;
    private final MessageService messageService;
    private final MessageUtilService messageUtilService;

    /**
     * Create conversation event.
     *
     * @param conversationId the conversation id
     * @param actorUserId    the logged in user id
     * @param targetUserIds  the targetUserIds - can be null
     * @return the message view dto
     */
    @Transactional
    public void createMessageWithConversationEvent(
        Long conversationId,
        Long actorUserId,
        Collection<Long> targetUserIds,
        ConversationEventType conversationType
    ) {
        MessageUpsertDTO messageDTO = new MessageUpsertDTO(conversationType.getName());
        Message savedMessage = messageUtilService.createTextMessage(conversationId, actorUserId, messageDTO, MessageTypeEnum.SYSTEM_EVENT);

        conversationParticipantRepository.restoreParticipantsByConversationId(conversationId);

        messageService.setLastSeenMessageForMessageSentUser(savedMessage.getConversation(), savedMessage, savedMessage.getSender());

        saveConversationEvent(conversationType, actorUserId, targetUserIds, savedMessage);
    }

    private void saveConversationEvent(ConversationEventType conversationType, Long actorUserId, Collection<Long> targetUserIds, Message savedMessage) {
        ChatUser actorUser = userService.getUserOrThrow(actorUserId);
        List<ChatUser> targetUsers;

        List<ConversationEvent> events = new ArrayList<>();
        if (targetUserIds != null && !targetUserIds.isEmpty()) {
            targetUsers = userRepository.findByIdInAndActiveTrueAndDeletedFalse(targetUserIds);

            for (ChatUser targetUser : targetUsers) {
                events.add(buildConversationEvent(conversationType, savedMessage, actorUser, targetUser));
            }
        } else {
            events.add(buildConversationEvent(conversationType, savedMessage, actorUser, null));
        }

        try {
            conversationEventRepository.saveAll(events);
        } catch (Exception e) {
            logger.error("conversation event save failed.", e);
            throw new CustomInternalServerErrorException("Failed to send message");
        }
    }

    private static ConversationEvent buildConversationEvent(ConversationEventType conversationType, Message savedMessage, ChatUser actorUser, ChatUser targetUser) {
        ConversationEvent conversationEvent = new ConversationEvent();
        conversationEvent.setEventType(conversationType);
        conversationEvent.setActorUser(actorUser);
        conversationEvent.setTargetUser(targetUser);
        conversationEvent.setMessage(savedMessage);
        return conversationEvent;
    }
}