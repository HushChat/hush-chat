package com.platform.software.chat.message.service;

import com.platform.software.chat.conversation.dto.ConversationEventCreated;
import com.platform.software.chat.conversation.dto.ConversationEventType;
import com.platform.software.chat.conversation.entity.ConversationEvent;
import com.platform.software.chat.conversation.repository.ConversationEventRepository;
import com.platform.software.chat.conversation.service.ConversationEventMessageService;
import com.platform.software.chat.conversationparticipant.repository.ConversationParticipantRepository;
import com.platform.software.chat.message.dto.MessageTypeEnum;
import com.platform.software.chat.message.dto.MessageUpsertDTO;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.exception.CustomInternalServerErrorException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
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
    private final ApplicationEventPublisher eventPublisher;
    private final MessageService messageService;
    private final MessageUtilService messageUtilService;
    private final ConversationEventMessageService conversationEventMessageService;

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
        conversationParticipantRepository.restoreParticipantsByConversationId(conversationId);

        List<ConversationEvent> events = buildConversationEvents(conversationId, actorUserId, targetUserIds, conversationType, messageDTO);

        saveConversationEvents(events);
    }

    private List<ConversationEvent> buildConversationEvents(Long conversationId, Long actorUserId, Collection<Long> targetUserIds, ConversationEventType conversationType, MessageUpsertDTO messageDTO) {
        List<ConversationEvent> events = new ArrayList<>();

        if (targetUserIds != null) {
            for (Long targetUserId : targetUserIds) {
                ConversationEvent event = createEventWithMessage(conversationId, actorUserId, conversationType, targetUserId, messageDTO);
                events.add(event);
            }
        } else {
            ConversationEvent event = createEventWithMessage(conversationId, actorUserId, conversationType, null, messageDTO);
            events.add(event);
        }
        return events;
    }

    private ConversationEvent createEventWithMessage(Long conversationId, Long actorUserId, ConversationEventType conversationType, Long targetUserId, MessageUpsertDTO messageDTO) {
        Message savedMessage = messageUtilService.createTextMessage(conversationId, actorUserId, messageDTO, MessageTypeEnum.SYSTEM_EVENT);
        messageService.setLastSeenMessageForMessageSentUser(savedMessage.getConversation(), savedMessage, savedMessage.getSender());

        ConversationEvent event = buildConversationEvent(conversationType, actorUserId, targetUserId, savedMessage);

        MessageViewDTO messageViewDTO = new MessageViewDTO(event.getMessage());
        conversationEventMessageService.setEventMessageText(event, messageViewDTO, actorUserId, true);

        eventPublisher.publishEvent(new ConversationEventCreated(
                WorkspaceContext.getCurrentWorkspace(),
                conversationId,
                messageViewDTO,
                actorUserId
        ));

        return event;
    }

    private ConversationEvent buildConversationEvent(ConversationEventType conversationType, Long actorUserId, Long targetUserId, Message savedMessage) {
        ChatUser actorUser = userService.getUserOrThrow(actorUserId);

        if (targetUserId != null) {
            ChatUser targetUser = userService.getUserOrThrow(targetUserId);
            return buildConversationEvent(conversationType, savedMessage, actorUser, targetUser);
        } else {
            return buildConversationEvent(conversationType, savedMessage, actorUser, null);
        }
    }

    private void saveConversationEvents(List<ConversationEvent> events) {
        try {
            conversationEventRepository.saveAll(events);
        } catch (Exception e) {
            logger.error("conversation events save failed.", e);
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