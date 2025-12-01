package com.platform.software.chat.message.attachment.repository;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import com.platform.software.chat.message.attachment.dto.MessageAttachmentDTO;
import com.platform.software.chat.message.attachment.entity.AttachmentTypeEnum;
import com.platform.software.chat.message.attachment.entity.MessageAttachment;
import com.platform.software.chat.message.attachment.entity.QMessageAttachment;
import com.platform.software.chat.message.attachment.service.AttachmentFilterCriteria;
import com.platform.software.chat.message.entity.QMessage;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

public class MessageAttachmentQueryRepositoryImpl implements MessageAttachmentQueryRepository {
    
    @PersistenceContext
    EntityManager entityManager;

    private static final QMessageAttachment qMessageAttachment = QMessageAttachment.messageAttachment;
    private static final QMessage qMessage = QMessage.message;

    private static final String MEDIA = "media";
    private static final String DOCS = "docs";

    @Override
    public Page<MessageAttachmentDTO> filterAttachments(
        AttachmentFilterCriteria filterCriteria,
        Pageable pageable
    ) {
        JPAQueryFactory queryFactory = new JPAQueryFactory(entityManager);

        JPAQuery<MessageAttachment> query = queryFactory
                .select(qMessageAttachment)
                .from(qMessageAttachment)
                .join(qMessageAttachment.message, qMessage)
                .where(qMessage.conversation.id.eq(filterCriteria.getConversationId()));
        
        applyFilters(query, filterCriteria);

        long total = query.fetchCount();

        List<MessageAttachment> attachments = query
            .offset(pageable.getOffset())
            .limit(pageable.getPageSize())
            .fetch();

        Page<MessageAttachmentDTO> attachmentDTOs = new PageImpl<>(
                attachments.stream().map(MessageAttachmentDTO::new).collect(Collectors.toList()),
                pageable, total);

        return attachmentDTOs;
    }

    private void applyFilters(JPAQuery<?> query, AttachmentFilterCriteria filterCriteria) {
        if (filterCriteria.getType() != null) {
            String type = filterCriteria.getType().toLowerCase();

            if (type.equals(MEDIA)) {
                query.where(qMessageAttachment.type.in(AttachmentTypeEnum.IMAGE, AttachmentTypeEnum.VIDEO,
                        AttachmentTypeEnum.AUDIO));
            } else if (type.equals(DOCS)) {
                query.where(qMessageAttachment.type.in(
                        AttachmentTypeEnum.DOCUMENT));
            }
        }
    }
}
