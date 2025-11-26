package com.platform.software.chat.conversationparticipant.repository;

import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.entity.QConversation;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantFilterCriteriaDTO;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantViewDTO;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.QConversationParticipant;
import com.platform.software.chat.user.dto.UserViewDTO;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.entity.QChatUser;
import com.platform.software.chat.user.service.UserUtilService;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Repository
public class ConversationParticipantQueryRepositoryImpl implements ConversationParticipantQueryRepository {
    private static final QConversationParticipant qConversationParticipant = QConversationParticipant.conversationParticipant;
    private static final QConversation qConversation = QConversation.conversation;
    private static final QChatUser qUser = QChatUser.chatUser;

    private final JPAQueryFactory queryFactory;

    public ConversationParticipantQueryRepositoryImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    private JPQLQuery<Long> getActiveConversationIdsForUser(Long userId) {
        return queryFactory.selectDistinct(qConversationParticipant.conversation.id)
            .from(qConversationParticipant)
            .where(qConversationParticipant.user.id.eq(userId)
                .and(qConversationParticipant.archived.isFalse()))
            .where(qConversationParticipant.isActive.isTrue())
            .where(qConversationParticipant.isDeleted.isFalse());
    }

    @Override
    public List<ConversationDTO> findAllConversationsByUserId(Long userId) {
        // Single query to get all participants for user's conversations
        List<Tuple> results = queryFactory
            .select(qConversationParticipant, qConversation, qUser)
            .from(qConversationParticipant)
            .leftJoin(qConversationParticipant.conversation, qConversation)
            .leftJoin(qConversationParticipant.user, qUser)
            .where(qConversationParticipant.isActive.isTrue())
            .where(qConversationParticipant.conversation.id.in(getActiveConversationIdsForUser(userId)))
            .fetch();

        if (results.isEmpty()) {
            return new ArrayList<>();
        }

        return buildConversationDTOs(results, userId);
    }

    @Override
    public Optional<ConversationDTO> findConversationByUserIdAndConversationId(Long userId, Long conversationId) {
        // Single query to check participation and get all participants
        List<Tuple> results = queryFactory
            .select(qConversationParticipant, qConversation, qUser)
            .from(qConversationParticipant)
            .leftJoin(qConversationParticipant.conversation, qConversation)
            .leftJoin(qConversationParticipant.user, qUser)
            .where(qConversationParticipant.isActive.isTrue())
            .where(qConversationParticipant.conversation.id.eq(
                    queryFactory.select(qConversationParticipant.conversation.id) // inner query to check if the user is in the conversation
                        .from(qConversationParticipant)
                        .where(qConversationParticipant.user.id.eq(userId)
                            .and(qConversationParticipant.conversation.id.eq(conversationId)))
                        .where(qConversationParticipant.isActive.isTrue())
                        .limit(1)
                ))
            .fetch();

        if (results.isEmpty()) {
            return Optional.empty();
        }

        List<ConversationDTO> conversationDTOs = buildConversationDTOs(results, userId);
        return conversationDTOs.isEmpty() ? Optional.empty() : Optional.of(conversationDTOs.getFirst());
    }

    @Override
    public List<ConversationDTO> findAllConversationByUserIdAndConversationIds(Long userId, Set<Long> conversationIds) {
        // Single query to check participation and get all participants
        List<Tuple> results = queryFactory
            .select(qConversationParticipant, qConversation, qUser)
            .from(qConversationParticipant)
            .leftJoin(qConversationParticipant.conversation, qConversation)
            .leftJoin(qConversationParticipant.user, qUser)
            .where(
                qConversationParticipant.user.id.eq(userId),
                qConversationParticipant.conversation.id.in(conversationIds)
            )
            .fetch();

        if (results.isEmpty()) {
            return new ArrayList<>();
        }

        List<ConversationDTO> conversationDTOs = buildConversationDTOs(results, userId);
        return conversationDTOs;
    }

    @Override
    public Optional<ConversationDTO> findConversationById(Long conversationId) {
        QConversationParticipant cp = QConversationParticipant.conversationParticipant;

        // TODO: Temporary fix - reset all isDeleted flags to false when recreating an existing conversation.
        // Proper solution: Add a deleted_at timestamp column in the database,
        // ensuring messages sent between deletion and rejoin are excluded when fetching messages.
        queryFactory.update(cp)
                .set(cp.isDeleted, false)
                .where(cp.conversation.id.eq(conversationId)
                        .and(cp.isDeleted.isTrue()))
                .execute();

        List<Tuple> results = queryFactory
            .select(cp, qConversation, qUser)
            .from(cp)
            .leftJoin(cp.conversation, qConversation)
            .leftJoin(cp.user, qUser)
            .where(cp.conversation.id.eq(conversationId)
                .and(cp.archived.eq(false)))
            .where(cp.isActive.isTrue())
            .distinct()
            .fetch();

        if (results.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(buildConversationDTO(results, null));
    }

    private List<ConversationDTO> buildConversationDTOs(List<Tuple> results, Long userId) {
        Map<Long, List<Tuple>> conversationGroups = results.stream()
            .filter(tuple -> tuple.get(qConversation) != null)
            .collect(Collectors.groupingBy(tuple -> tuple.get(qConversation).getId()));

        return conversationGroups.values().stream()
            .map(conversationData -> buildConversationDTO(conversationData, userId))
            .collect(Collectors.toList());
    }

    private ConversationDTO buildConversationDTO(List<Tuple> conversationData, Long userId) {
        Conversation conv = conversationData.getFirst().get(qConversation);
        ConversationDTO conversationDTO = new ConversationDTO(conv);

        List<ConversationParticipantViewDTO> participantViewDTOs = conversationData.stream()
            .map(tuple -> {
                ConversationParticipant participant = tuple.get(qConversationParticipant);
                ChatUser user = tuple.get(qUser);

                if(user != null) {
                    ConversationParticipantViewDTO viewDTO = new ConversationParticipantViewDTO();
                    viewDTO.setId(participant.getId());
                    viewDTO.setRole(participant.getRole());
                    viewDTO.setUser(new UserViewDTO(user));

                    viewDTO.setIsArchivedByParticipant(participant.getArchived());
                    viewDTO.setIsPinnedByParticipant(participant.getIsPinned());
                    viewDTO.setIsFavoriteByParticipant(participant.getIsFavorite());
                    viewDTO.setIsMutedByParticipant(ConversationUtilService.isMuted(participant.getMutedUntil()));

                    return viewDTO;
                }

                return null;
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        conversationDTO.setParticipants(participantViewDTOs);

        // Set conversation name logic for non-group conversations (only if userId provided)
        UserUtilService.setConversationNameForNonGroup(userId, conversationDTO, false);

        return conversationDTO;
    }

    @Override
    @Transactional
    public long updateIsActiveById(Long id, Boolean isActive) {
        return queryFactory
            .update(qConversationParticipant)
            .set(qConversationParticipant.isActive, isActive)
            .set(qConversationParticipant.inactiveFrom, isActive ? null : ZonedDateTime.now())
            .where(qConversationParticipant.id.eq(id))
            .execute();
    }

    @Override
    public Page<ConversationDTO> findPinnedConversationsByUserId(Long userId, Pageable pageable) {
        BooleanExpression predicate = qConversationParticipant.user.id.eq(userId)
                .and(qConversationParticipant.isPinned.isTrue())
                .and(qConversationParticipant.archived.eq(false))
                .and(qConversationParticipant.isActive.isTrue())
                .and(qConversation.deleted.eq(false));

        JPAQuery<?> baseQuery = queryFactory
                .from(qConversationParticipant)
                .leftJoin(qConversationParticipant.conversation, qConversation)
                .where(predicate);

        Long total = baseQuery.clone()
                .select(qConversationParticipant.conversation.id.countDistinct())
                .fetchOne();
        long totalCount = Objects.requireNonNullElse(total, 0L);

        if (totalCount == 0)
            return new PageImpl<>(new ArrayList<>(), pageable, 0);

        JPQLQuery<Long> conversationIdsSubquery = baseQuery.clone()
                .select(qConversationParticipant.conversation.id)
                .orderBy(qConversation.updatedAt.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize());

        List<Tuple> results = queryFactory
                .select(qConversationParticipant, qConversation, qUser)
                .from(qConversationParticipant)
                .leftJoin(qConversationParticipant.conversation, qConversation)
                .leftJoin(qConversationParticipant.user, qUser)
                .where(qConversationParticipant.conversation.id.in(conversationIdsSubquery))
                .orderBy(qConversation.updatedAt.desc())
                .fetch();

        List<ConversationDTO> conversationDTOs = buildConversationDTOs(results, userId);
        return new PageImpl<>(conversationDTOs, pageable, totalCount);
    }

    @Override
    public Page<ConversationDTO> getFavouriteConversationsByUserId(Long userId, Pageable pageable) {
        BooleanExpression predicate = qConversationParticipant.user.id.eq(userId)
                .and(qConversationParticipant.isFavorite.isTrue())
                .and(qConversationParticipant.archived.eq(false))
                .and(qConversationParticipant.isActive.isTrue())
                .and(qConversation.deleted.eq(false));

        Long total = queryFactory
                .select(qConversationParticipant.conversation.id.countDistinct())
                .from(qConversationParticipant)
                .leftJoin(qConversationParticipant.conversation, qConversation)
                .where(predicate)
                .fetchOne();
        long totalCount = Objects.requireNonNullElse(total, 0L);

        if (totalCount == 0)
            return new PageImpl<>(new ArrayList<>(), pageable, 0);

        JPQLQuery<Long> conversationIdsSubquery = JPAExpressions.select(qConversationParticipant.conversation.id)
                .from(qConversationParticipant)
                .leftJoin(qConversationParticipant.conversation, qConversation)
                .where(predicate)
                .orderBy(qConversation.updatedAt.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize());

        List<Tuple> results = queryFactory
                .select(qConversationParticipant, qConversation, qUser)
                .from(qConversationParticipant)
                .leftJoin(qConversationParticipant.conversation, qConversation)
                .leftJoin(qConversationParticipant.user, qUser)
                .where(qConversationParticipant.conversation.id.in(conversationIdsSubquery)
                        .and(qConversationParticipant.isActive.isTrue()))
                .orderBy(qConversation.updatedAt.desc())
                .fetch();

        List<ConversationDTO> conversationDTOs = buildConversationDTOs(results, userId);
        return new PageImpl<>(conversationDTOs, pageable, totalCount);
    }

    @Override
    public Page<ConversationDTO> findConversationsByMatchingKeyword(String searchKeyword, Long loggedInUser, Pageable pageable) {

        BooleanExpression searchCondition = qConversation.id.in(getActiveConversationIdsForUser(loggedInUser))
            .and(
                qConversation.isGroup.isFalse()
                    .and(JPAExpressions.selectOne()
                        .from(qConversationParticipant)
                        .leftJoin(qConversationParticipant.user, qUser)
                        .where(qConversationParticipant.conversation.id.eq(qConversation.id)
                            .and(qConversationParticipant.user.id.ne(loggedInUser))
                            .and(qConversationParticipant.isActive.isTrue())
                            .and(qUser.firstName.containsIgnoreCase(searchKeyword)
                                .or(qUser.lastName.containsIgnoreCase(searchKeyword))))
                        .exists())
                    .or(
                        qConversation.isGroup.isTrue()
                            .and(qConversation.name.containsIgnoreCase(searchKeyword))
                    )
            );

        Long total = queryFactory
            .select(qConversation.count())
            .from(qConversation)
            .where(searchCondition)
            .fetchOne();
        long totalCount = Objects.requireNonNullElse(total, 0L);

        JPAQuery<Conversation> baseQuery = queryFactory
            .selectDistinct(qConversation)
            .from(qConversation)
            .where(searchCondition);

        if (totalCount == 0) {
            return new PageImpl<>(new ArrayList<>(), pageable, 0);
        }

        List<Conversation> conversations = baseQuery
            .offset(pageable.getOffset())
            .limit(pageable.getPageSize())
            .fetch();

        List<ConversationDTO> conversationDTOs = conversations.stream()
            .map(ConversationDTO::new)
            .collect(Collectors.toList());

        return new PageImpl<>(conversationDTOs, pageable, totalCount);
    }

    @Override
    public Page<ConversationParticipant> findConversationParticipantsByCriteria(
        Long conversationId,
        Pageable pageable,
        ConversationParticipantFilterCriteriaDTO filterCriteria
    ) {
        BooleanBuilder where = new BooleanBuilder();

        where.and(qConversationParticipant.conversation.id.eq(conversationId))
                .and(qConversationParticipant.isActive.isTrue())
                .and(qConversationParticipant.isDeleted.isFalse());

        if (StringUtils.hasText(filterCriteria.getKeyword())) {
            String keyword = filterCriteria.getKeyword().trim();
            where.and(
                qUser.firstName.containsIgnoreCase(keyword)
                        .or(qUser.lastName.containsIgnoreCase(keyword))
                        .or(qUser.email.containsIgnoreCase(keyword))
                        .or(qUser.username.containsIgnoreCase(keyword))
            );
        }

        Long total = queryFactory
                .select(qConversationParticipant.id.count())
                .from(qConversationParticipant)
                .join(qConversationParticipant.user, qUser)
                .where(where)
                .fetchOne();

        List<ConversationParticipant> participants = queryFactory
                .selectFrom(qConversationParticipant)
                .join(qConversationParticipant.user, qUser).fetchJoin()
                .where(where)
                .orderBy(qUser.firstName.asc(), qUser.lastName.asc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        return new PageImpl<>(participants, pageable, total != null ? total : 0L);
    }

    @Override
    public void restoreParticipantsByConversationId(Long conversationId){
        queryFactory.update(qConversationParticipant)
                .set(qConversationParticipant.isDeleted, false)
                .where(qConversationParticipant.conversation.id.eq(conversationId)
                        .and(qConversationParticipant.isDeleted.eq(true)))
                .execute();
    }

    @Override
    public List<Long> findOneToOneConversationIdsByUserEmail(String email) {
        return queryFactory
            .select(qConversationParticipant.conversation.id)
            .from(qConversationParticipant)
            .join(qConversationParticipant.user, qUser)
            .join(qConversationParticipant.conversation, qConversation)
            .where(
                qUser.email.eq(email)
                    .and(qConversation.isGroup.isFalse())
                    .and(qConversation.deleted.isFalse())
                    .and(qConversationParticipant.isActive.isTrue())
                    .and(qConversationParticipant.isDeleted.isFalse())
            )
            .distinct()
            .fetch();
    }
}
