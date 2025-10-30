package com.platform.software.chat.message.repository;

import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.controller.external.IdBasedPageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.platform.software.chat.message.entity.Message;

import java.util.Optional;

public interface MessageQueryRepository {
    Message saveMessageWthSearchVector(Message message);

    Optional<Message> findDeletableMessage(Long messageId, Long loggedInUserId);

    Page<Message> findMessagesAndAttachments(Long conversationId, IdBasedPageRequest idBasedPageRequest, ConversationParticipant participant);
}
