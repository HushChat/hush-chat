package com.platform.software.chat.message.service;

import com.platform.software.chat.conversation.readstatus.dto.MessageSeenEvent;
import com.platform.software.chat.conversation.dto.ConversationEventCreated;
import com.platform.software.chat.message.dto.MessagePinEvent;
import com.platform.software.chat.message.dto.MessageReactionEvent;
import com.platform.software.chat.message.dto.MessageUnsentEvent;
import com.platform.software.chat.message.dto.MessageCreatedEvent;
import com.platform.software.chat.message.dto.MessageUpdatedEvent;
import com.platform.software.chat.notification.service.ChatNotificationService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class ChatEventListener {
    private final MessagePublisherService messagePublisherService;
    private final ChatNotificationService chatNotificationService;

    public ChatEventListener(MessagePublisherService messagePublisherService, ChatNotificationService chatNotificationService) {
        this.messagePublisherService = messagePublisherService;
        this.chatNotificationService = chatNotificationService;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMessageCreated(MessageCreatedEvent event) {
        messagePublisherService.invokeNewMessageToParticipants(
                event.getConversationId(),
                event.getMessageViewDTO(),
                event.getUserId(),
                event.getWorkspaceId()
        );

        chatNotificationService.sendMessageNotificationsToParticipants(
                event.getConversationId(),
                event.getUserId(),
                event.getMessage()
        );
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onConversationEvent(ConversationEventCreated event) {
        messagePublisherService.invokeNewMessageToParticipants(
                event.conversationId(),
                event.messageViewDTO(),
                event.actorUserId(),
                event.workspaceId()
        );
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMessageReaction(MessageReactionEvent event) {
        messagePublisherService.invokeMessageReactionToParticipants(
            event.getConversationId(),
            event.getMessage().getId(),
            event.getUser().getId(),
            event.getReactionType(),
            event.getPreviousReactionType(),
            event.getReactionAction(),
            event.getWorkspaceId()
        );

        chatNotificationService.sendMessageReactionNotifications(
                event.getMessage(),
                event.getUser()
        );
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMessageUnsent(MessageUnsentEvent event) {
        messagePublisherService.invokeMessageUnsentToParticipants(
                event.getConversationId(),
                event.getMessageId(),
                event.getActorUserId(),
                event.getWorkspaceId()
        );
    }
  
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMessageSeen(MessageSeenEvent event) {
        messagePublisherService.invokeMessageReadStatusToParticipants(
                event.workspaceId(),
                event.conversationId(),
                event.actorUserId(),
                event.lastSeenMessageId()
        );
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMessageUpdated(MessageUpdatedEvent event) {
        messagePublisherService.invokeMessageUpdatedToParticipants(
                event.getConversationId(),
                event.getMessageViewDTO(),
                event.getActorUserId(),
                event.getWorkspaceId());
    }
  
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMessagePin(MessagePinEvent event){
        messagePublisherService.invokeMessagePinToParticipants(
                event.workspace(),
                event.conversationId(),
                event.pinnedMessage(),
                event.actorUserId()
        );
    }
}
