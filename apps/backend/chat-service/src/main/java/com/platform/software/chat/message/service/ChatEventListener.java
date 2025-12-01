package com.platform.software.chat.message.service;

import com.platform.software.chat.message.dto.MessageReactionEvent;
import com.platform.software.chat.message.dto.MessageCreatedEvent;
import com.platform.software.chat.notification.service.ChatNotificationService;
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

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMessageCreated(MessageCreatedEvent event) {
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

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMessageReaction(MessageReactionEvent event) {
        chatNotificationService.sendMessageReactionNotifications(
                event.getMessage(),
                event.getUser()
        );
    }
}
