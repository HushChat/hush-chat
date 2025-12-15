package com.platform.software.chat.conversation.repository;

import com.platform.software.chat.conversation.dto.*;
import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.entity.QConversation;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.QConversationParticipant;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.entity.QMessage;
import com.platform.software.chat.notification.entity.DeviceType;
import com.platform.software.chat.user.entity.ChatUserStatus;
import com.platform.software.chat.user.entity.QChatUser;
import com.platform.software.chat.user.entity.QUserBlock;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.exception.CustomBadRequestException;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;

import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.util.StringUtils;

public class ConversationQueryRepositoryImpl implements ConversationQueryRepository {

    private final JPAQueryFactory jpaQueryFactory;

    private static final QConversation qConversation = QConversation.conversation;
    private static final QConversationParticipant qConversationParticipant = QConversationParticipant.conversationParticipant;
    private static final QMessage qMessage = QMessage.message;
    private static final QMessage qMessage2 = QMessage.message;
    private final WebSocketSessionManager webSocketSessionManager;

    public ConversationQueryRepositoryImpl(JPAQueryFactory jpaQueryFactory, @Lazy WebSocketSessionManager webSocketSessionManager) {
        this.jpaQueryFactory = jpaQueryFactory;
        this.webSocketSessionManager = webSocketSessionManager;
    }

    @Override
    public Optional<Conversation> findDirectConversationBetweenUsers(Long userId1, Long userId2) {
        Conversation result = jpaQueryFactory
                .select(qConversation)
                .from(qConversation)
                .join(qConversation.conversationParticipants, qConversationParticipant)
                .where(qConversation.isGroup.eq(false)
                        .and(qConversationParticipant.user.id.in(userId1, userId2)))
                .groupBy(qConversation.id)
                .having(qConversationParticipant.count().eq(2L))
                .fetchOne();

        return Optional.ofNullable(result);
    }

    /**
     * Get chat summary statistics for a user using conditional aggregation.
     *
     * @param userId the user ID to get statistics for
     * @return ChatSummaryDTO with conversation counts
     */

    @Override
    public ChatSummaryDTO getChatSummaryForUser(Long userId) {

        BooleanExpression baseCondition = qConversationParticipant.user.id.eq(userId)
                .and(qConversationParticipant.isActive.isTrue());

        // Active Chats
        var activeCountExpr = new CaseBuilder()
                .when(qConversationParticipant.archived.isFalse())
                .then(1L).otherwise(0L)
                .sum().as("active");
        // Archived Chats
        var archivedCountExpr = new CaseBuilder()
                .when(qConversationParticipant.archived.isTrue())
                .then(1L).otherwise(0L)
                .sum().as("archived");
        // Favorite Chats
        var favoriteCountExpr = new CaseBuilder()
                .when(qConversationParticipant.isFavorite.isTrue())
                .then(1L).otherwise(0L)
                .sum().as("favorite");
        // Muted Count
        var mutedCountExpr = new CaseBuilder()
                .when(qConversationParticipant.mutedUntil.isNotNull()
                        .and(qConversationParticipant.mutedUntil.after(ZonedDateTime.now())))
                .then(1L).otherwise(0L)
                .sum().as("muted");
        // Pinned Count
        var pinnedCountExpr = new CaseBuilder()
                .when(qConversation.pinnedMessage.isNotNull())
                .then(1L).otherwise(0L)
                .sum().as("pinned");

        Tuple result = jpaQueryFactory
                .select(activeCountExpr, archivedCountExpr, favoriteCountExpr, mutedCountExpr,
                        pinnedCountExpr)
                .from(qConversation)
                .join(qConversation.conversationParticipants, qConversationParticipant)
                .where(baseCondition)
                .distinct()
                .fetchOne();

        Long activeConversations = Optional.ofNullable(result.get(activeCountExpr)).orElse(0L);
        Long archivedCount = Optional.ofNullable(result.get(archivedCountExpr)).orElse(0L);
        Long favoriteCount = Optional.ofNullable(result.get(favoriteCountExpr)).orElse(0L);
        Long mutedCount = Optional.ofNullable(result.get(mutedCountExpr)).orElse(0L);
        Long pinnedCount = Optional.ofNullable(result.get(pinnedCountExpr)).orElse(0L);

        return new ChatSummaryDTO(
                activeConversations,
                favoriteCount,
                archivedCount,
                pinnedCount,
                mutedCount);
    }

    public Page<ConversationDTO> findAllConversationsByUserIdWithLatestMessages(
        Long userId,
        ConversationFilterCriteriaDTO conversationFilterCriteria,
        Pageable pageable
    ) {

        boolean isArchived = conversationFilterCriteria.getIsArchived() != null
                ? conversationFilterCriteria.getIsArchived()
                : false;
        boolean isFavorite = conversationFilterCriteria.getIsFavorite() != null
                ? conversationFilterCriteria.getIsFavorite()
                : false;
        boolean isGroup = conversationFilterCriteria.getIsGroup() != null
                ? conversationFilterCriteria.getIsGroup()
                : false;
        boolean isMuted = conversationFilterCriteria.getIsMuted() != null
                ? conversationFilterCriteria.getIsMuted()
                : false;

        BooleanExpression whereConditions = qConversationParticipant.user.id.eq(userId)
                .and(qConversation.deleted.eq(false))
                .and(qConversationParticipant.isDeleted.eq(false));

        whereConditions = whereConditions.and(
                qMessage.isNotNull().or(qConversation.isGroup.eq(true))
        );

        if (isGroup) {
                whereConditions = whereConditions.and(qConversation.isGroup.eq(isGroup));
        }

        if (isMuted) {
                whereConditions = whereConditions.and(qConversationParticipant.mutedUntil.isNotNull());
        }

        if (isArchived) {
            whereConditions = whereConditions.and(qConversationParticipant.archived.eq(true));
        } else if (isFavorite) {
            whereConditions = whereConditions.and(qConversationParticipant.isFavorite.eq(true))
                                             .and(qConversationParticipant.archived.eq(false));
        } else {
            whereConditions = whereConditions.and(qConversationParticipant.archived.eq(false));
        }

        JPAQuery<?> baseQuery = jpaQueryFactory
                .from(qConversation)
                .innerJoin(qConversationParticipant).on(qConversationParticipant.conversation.eq(qConversation))
                .leftJoin(qMessage).on(qMessage.conversation.eq(qConversation)
                        .and(qMessage.id.eq(
                                JPAExpressions.select(qMessage2.id.max())
                                        .from(qMessage2)
                                        .where(qMessage2.conversation.eq(qConversation)))))
                .where(whereConditions);

        boolean isValidSearchKey = StringUtils.hasText(conversationFilterCriteria.getSearchKeyword());
        if (isValidSearchKey) {
            baseQuery.where(qConversation.isGroup.isTrue()
                .and(qConversation.name.containsIgnoreCase(conversationFilterCriteria.getSearchKeyword())));
        }

        Long totalCount = baseQuery.clone()
                .select(qConversation.count())
                .fetchOne();

        // Get all conversations where user is a participant
        List<Tuple> results = baseQuery.clone()
                .select(qConversation, qMessage, qConversationParticipant)
                .orderBy(
                        // Primary sort: Pinned conversations first
                        qConversationParticipant.isPinned.desc().nullsLast(),
                        // Secondary sort: Among pinned conversations, most recently pinned first
                        qConversationParticipant.pinnedAt.desc().nullsLast(),
                        // Tertiary sort: Latest message timestamp (for both pinned and non-pinned)
                        qMessage.createdAt.desc().nullsLast(),
                        // Final sort: Conversation creation time
                        qConversation.createdAt.desc())
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .fetch();

        List<ConversationDTO> conversationDTOs = results.stream()
                .map(tuple -> {
                    Conversation conversation = tuple.get(qConversation);
                    Message latestMessage = tuple.get(qMessage);

                    ConversationDTO dto = new ConversationDTO(conversation);

                    if (conversation != null && conversation.getConversationParticipants() != null) {
                        ConversationParticipant loggedInParticipant = null;
                        ConversationParticipant otherParticipant = null;

                        boolean needOtherParticipant = !conversation.getIsGroup();

                        for (ConversationParticipant participant : conversation.getConversationParticipants()) {
                            if (participant.getUser() != null && participant.getUser().getId() != null) {
                                if (participant.getUser().getId().equals(userId)) {
                                    loggedInParticipant = participant;
                                } else if (needOtherParticipant) {
                                    otherParticipant = participant;
                                }
                            }

                            if (loggedInParticipant != null &&
                                    (!needOtherParticipant || otherParticipant != null)) {
                                break;
                            }
                        }

                        if (loggedInParticipant != null) {
                            dto.setFavoriteByLoggedInUser(loggedInParticipant.getIsFavorite());
                            dto.setPinnedByLoggedInUser(loggedInParticipant.getIsPinned());
                            dto.setMutedByLoggedInUser(ConversationUtilService.isMuted(loggedInParticipant.getMutedUntil()));
                        }

                        if (needOtherParticipant && otherParticipant != null) {
                            if (otherParticipant.getUser().getFirstName() != null && otherParticipant.getUser().getLastName() != null) {
                                String name = otherParticipant.getUser().getFirstName() + " " + otherParticipant.getUser().getLastName();
                                String imageIndexedName = otherParticipant.getUser().getImageIndexedName();
                                dto.setName(name);
                                dto.setImageIndexedName(imageIndexedName);

                                ChatUserStatus status = webSocketSessionManager.getUserChatStatus(WorkspaceContext.getCurrentWorkspace(),
                                        otherParticipant.getUser().getEmail());

                                DeviceType deviceType = webSocketSessionManager.getUserDeviceType(
                                        WorkspaceContext.getCurrentWorkspace(),
                                        otherParticipant.getUser().getEmail()
                                );

                                dto.setChatUserStatus(status);
                                dto.setDeviceType(deviceType);
                            }
                        }
                    }

                    if (latestMessage != null) {
                        MessageViewDTO messageViewDTO = new MessageViewDTO(latestMessage);
                        dto.setMessages(List.of(messageViewDTO));
                    }

                    return dto;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(conversationDTOs, pageable, totalCount);
    }

    @Override
    public ConversationParticipant getOtherParticipantInOneToOneConversationOrThrow(Long conversationId, Long userId) {
        ConversationParticipant otherParticipant = jpaQueryFactory
                .selectFrom(qConversationParticipant)
                .where(
                        qConversationParticipant.conversation.id.eq(conversationId)
                        .and(qConversationParticipant.conversation.isGroup.isFalse())
                        .and(qConversationParticipant.user.id.ne(userId))
                )
                .fetchOne();

        if (otherParticipant == null) {
            throw new CustomBadRequestException("No other user found in this one-to-one conversation or conversation is a group.");
        }

        return otherParticipant;
    }

    @Override
    public List<Conversation> getOneToOneConversationsForCurrentUser(Long userId) {
        return jpaQueryFactory
                .select(qConversation)
                .from(qConversation)
                .join(qConversation.conversationParticipants, qConversationParticipant)
                .where(qConversation.isGroup.eq(false)
                        .and(qConversationParticipant.user.id.eq(userId)))
                .groupBy(qConversation.id)
                .fetch();
    }

    @Override
    public ConversationMetaDataDTO findConversationMetaData(Long conversationId, Long userId){
        Conversation conversation = jpaQueryFactory
                .select(qConversation)
                .from(qConversation)
                .join(qConversation.conversationParticipants, qConversationParticipant)
                .where(qConversation.id.eq(conversationId)
                        .and(qConversation.deleted.isFalse())
                        .and(qConversationParticipant.user.id.eq(userId))
                        .and(qConversationParticipant.isDeleted.isFalse()))
                .fetchFirst();

        if(conversation == null) {
            throw new CustomBadRequestException("Conversation not found or you don't have access to it.");
        }

        return new ConversationMetaDataDTO(conversation);
    }

    @Override
    public boolean getIsActiveByConversationIdAndUserId(Long conversationId, Long userId){
        return jpaQueryFactory
                .selectFrom(qConversationParticipant)
                .where(qConversationParticipant.conversation.id.eq(conversationId)
                        .and(qConversationParticipant.user.id.eq(userId))
                        .and(qConversationParticipant.isActive.isTrue()))
                .fetchFirst() != null;
    }
  
    public Optional<DirectOtherMetaDTO> findDirectOtherMeta(Long conversationId, Long userId) {
          QConversation c = QConversation.conversation;
          QConversationParticipant cpSelf = QConversationParticipant.conversationParticipant;
          QConversationParticipant cpOther = new QConversationParticipant("cpOther");
          QChatUser uOther = QChatUser.chatUser;
          QUserBlock b = QUserBlock.userBlock;

          DirectOtherMetaDTO row = jpaQueryFactory
                  .select(Projections.bean(DirectOtherMetaDTO.class,
                          uOther.id.as("otherUserId"),
                          uOther.firstName.as("firstName"),
                          uOther.lastName.as("lastName"),
                          uOther.email.as("email"),
                          uOther.imageIndexedName.as("imageIndexedName"),
                          b.id.isNotNull().as("blocked")
                  ))
                  .from(c)
                  // ensure requester is an active participant of this conversation
                  .join(cpSelf).on(
                          cpSelf.conversation.eq(c)
                                  .and(cpSelf.user.id.eq(userId))
                                  .and(cpSelf.isDeleted.isFalse())
                  )
                  // get the other active participant
                  //we don't need to check if the other participant is deleted here because we are only fetching other user meta info
                  .join(cpOther).on(
                          cpOther.conversation.eq(c)
                                  .and(cpOther.user.id.ne(userId))
                  )
                  .join(uOther).on(uOther.eq(cpOther.user))
                  .leftJoin(b).on( // here we are only checking if the logged-in user has blocked the other user
                          b.blocker.id.eq(userId)
                                  .and(b.blocked.id.eq(uOther.id))
                  )
                  .where(
                          c.id.eq(conversationId),
                          c.isGroup.isFalse() // direct chat only
                  )
                  .fetchOne();

          return Optional.ofNullable(row);
      }

    /**
     * Finds direct conversations between a logged-in user and multiple target users.
     * 
     * @param loggedInUserId ID of the logged-in user
     * @param targetUserIds List of user IDs to check for existing conversations
     * @return Map where:
     *         - Key: Target user ID (from targetUserIds list)
     *         - Value: Conversation ID of the direct conversation between 
     *                  loggedInUserId and the target user
     *         - Note: Users without existing conversations are NOT included in the map
     */
    @Override
    public Map<Long, Long> findDirectConversationsBatch(Long loggedInUserId, List<Long> targetUserIds) {
        QConversationParticipant cp1 = new QConversationParticipant("loggedInParticipant");
        QConversationParticipant cp2 = new QConversationParticipant("targetParticipant");

        if (targetUserIds == null || targetUserIds.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Tuple> results = jpaQueryFactory
            .select(cp2.user.id, qConversation.id)
            .from(qConversation)
            .join(cp1).on(cp1.conversation.id.eq(qConversation.id))
            .join(cp2).on(cp2.conversation.id.eq(qConversation.id))
            .where(
                qConversation.isGroup.eq(false)
                    .and(qConversation.deleted.eq(false))
                    .and(cp1.user.id.eq(loggedInUserId))
                    .and(cp2.user.id.in(targetUserIds))
                    .and(cp1.user.id.ne(cp2.user.id))
                    .and(cp1.isActive.eq(true))
                    .and(cp1.isDeleted.eq(false))
                    .and(cp2.isActive.eq(true))
                    .and(cp2.isDeleted.eq(false))
            )
            .fetch();

        return results.stream()
            .collect(Collectors.toMap(
                tuple -> tuple.get(cp2.user.id),
                tuple -> tuple.get(qConversation.id),
                (existing, replacement) -> existing
            ));
    }

    /**
     * Admin view: Paginated retrieval of all group conversations with participant counts.
     *
     * @param pageable Pagination information
     * @return Page of ConversationAdminViewDTO containing group conversation details
     */
    @Override
    public Page<ConversationAdminViewDTO> findAllGroupConversationsAdminView(Pageable pageable){
        JPAQuery<ConversationAdminViewDTO> query = jpaQueryFactory
                .select(Projections.constructor(ConversationAdminViewDTO.class,
                        qConversation.id,
                        qConversation.name,
                        qConversation.createdAt,
                        qConversation.description,
                        qConversation.imageIndexedName,
                        qConversation.deleted,
                        qConversation.createdBy.id,
                        qConversation.createdBy.firstName,
                        qConversation.createdBy.lastName,
                        qConversation.createdBy.email,
                        JPAExpressions.select(qConversationParticipant.count())
                                .from(qConversationParticipant)
                                .where(qConversationParticipant.conversation.id.eq(qConversation.id))
                ))
                .from(qConversation)
                .where(qConversation.isGroup.eq(true));

        Long totalCount = jpaQueryFactory
                .select(qConversation.count())
                .from(qConversation)
                .where(qConversation.isGroup.eq(true))
                .fetchOne();

        List<ConversationAdminViewDTO> results = query
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .fetch();

        return new PageImpl<>(results, pageable, totalCount);
    }
}
