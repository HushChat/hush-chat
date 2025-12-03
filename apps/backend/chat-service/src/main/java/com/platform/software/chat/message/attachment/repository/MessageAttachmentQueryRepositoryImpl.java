package com.platform.software.chat.message.attachment.repository;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import com.platform.software.chat.message.attachment.dto.MessageAttachmentDTO;
import com.platform.software.chat.message.attachment.entity.AttachmentFilterTypeEnum;
import com.platform.software.chat.message.attachment.entity.AttachmentTypeEnum;
import com.platform.software.chat.message.attachment.entity.MessageAttachment;
import com.platform.software.chat.message.attachment.entity.QMessageAttachment;
import com.platform.software.chat.message.attachment.service.AttachmentFilterCriteria;
import com.platform.software.chat.message.entity.QMessage;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

public class MessageAttachmentQueryRepositoryImpl implements MessageAttachmentQueryRepository {
    
    private final JPAQueryFactory jpaQueryFactory;

    private static final QMessageAttachment qMessageAttachment = QMessageAttachment.messageAttachment;
    private static final QMessage qMessage = QMessage.message;

    private static final Map<AttachmentFilterTypeEnum, Set<AttachmentTypeEnum>> FILTER_MAP = Map.of(
        AttachmentFilterTypeEnum.MEDIA, Set.of(AttachmentTypeEnum.IMAGE, AttachmentTypeEnum.VIDEO, AttachmentTypeEnum.AUDIO),
        AttachmentFilterTypeEnum.DOCS, Set.of(AttachmentTypeEnum.DOCUMENT)
    );

    public MessageAttachmentQueryRepositoryImpl(JPAQueryFactory jpaQueryFactory) {
        this.jpaQueryFactory = jpaQueryFactory;
    }

    @Override
    public Page<MessageAttachmentDTO> filterAttachments(
        AttachmentFilterCriteria filterCriteria,
        Pageable pageable
    ) {
        JPAQuery<MessageAttachment> query = jpaQueryFactory
                .select(qMessageAttachment)
                .from(qMessageAttachment)
                .join(qMessageAttachment.message, qMessage)
                .where(qMessage.conversation.id.eq(filterCriteria.getConversationId()));
        
        applyFilters(query, filterCriteria);

        Long totalCount = query.clone()
                .select(qMessageAttachment.count())
                .fetchOne();


        List<MessageAttachment> attachments = query
            .offset(pageable.getOffset())
            .limit(pageable.getPageSize())
            .fetch();

        Page<MessageAttachmentDTO> attachmentDTOs = new PageImpl<>(
                attachments.stream().map(MessageAttachmentDTO::new).collect(Collectors.toList()),
                pageable, totalCount);

        return attachmentDTOs;
    }

    private void applyFilters(JPAQuery<MessageAttachment> query, AttachmentFilterCriteria filterCriteria) {
         if (filterCriteria.getType() != null) {
            Set<AttachmentTypeEnum> types = FILTER_MAP.get(filterCriteria.getType());
            if (types != null && !types.isEmpty()) {
                query.where(qMessageAttachment.type.in(types));
            }
        }
    }
}
