package com.platform.software.chat.message.attachment.repository;

import com.platform.software.chat.message.attachment.entity.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, Long>, MessageAttachmentQueryRepository {
    List<MessageAttachment> findByMessageId(Long messageId);

    List<MessageAttachment> findByMessage_ConversationId(Long conversationId);

    Optional<MessageAttachment> findByIdAndMessage_Sender_Id(Long id, Long senderId);
}
