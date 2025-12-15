package com.platform.software.chat.conversation.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import com.platform.software.chat.conversation.dto.ConversationCreatedEvent;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ConversationEventListener {
  private final ConversationPublisherService conversationPublisherService;

  @Async
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onConversationCreated(ConversationCreatedEvent event) {
    conversationPublisherService.invokeNewConversationToParticipants(
      event.getConversationId(),
      event.getActorUserId(),
      event.getWorkspaceId(),
      event.getConversationDTO()
    );
  }
}
