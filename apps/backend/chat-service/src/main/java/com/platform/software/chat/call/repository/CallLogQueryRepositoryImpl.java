package com.platform.software.chat.call.repository;

import com.platform.software.chat.call.dto.CallLogViewDTO;
import com.platform.software.chat.call.dto.CallParticipantViewDTO;
import com.platform.software.chat.call.entity.QCallLog;
import com.platform.software.chat.call.entity.QCallParticipant;
import com.platform.software.chat.conversation.entity.QConversation;
import com.platform.software.chat.user.dto.UserViewDTO;
import com.platform.software.chat.user.entity.QChatUser;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.*;
import java.util.stream.Collectors;

@Repository
public class CallLogQueryRepositoryImpl implements CallLogQueryRepository {

    private final JPAQueryFactory queryFactory;

    private static final QCallLog qCallLog = QCallLog.callLog;
    private static final QCallParticipant qCallParticipant = QCallParticipant.callParticipant;
    private static final QConversation qConversation = QConversation.conversation;
    private static final QChatUser qInitiator = new QChatUser("initiator");
    private static final QChatUser qParticipant = new QChatUser("participant");

    public CallLogQueryRepositoryImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public Page<CallLogViewDTO> findCallLogsByParticipantUserId(Long userId, Pageable pageable) {
        Long totalCount = countCallLogsByUserId(userId);
        if (totalCount == 0) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        List<Long> callLogIds = fetchPagedCallLogIds(userId, pageable);
        if (callLogIds.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, totalCount);
        }

        List<Tuple> callLogDetailsTuples = fetchCallLogDetailsByIds(callLogIds);

        Map<Long, List<Tuple>> callLogGroups = callLogDetailsTuples.stream()
                .collect(Collectors.groupingBy(tuple -> tuple.get(qCallLog.id)));

        List<CallLogViewDTO> callLogDTOs = callLogIds.stream()
                .filter(callLogGroups::containsKey)
                .map(callLogId -> {
                    List<Tuple> callLogData = callLogGroups.get(callLogId);
                    Tuple firstRow = callLogData.get(0);
                    UserViewDTO initiator = new UserViewDTO(firstRow.get(qInitiator));

                    CallLogViewDTO callLogViewDTO = new CallLogViewDTO(
                            firstRow.get(qCallLog.id),
                            firstRow.get(qConversation.id),
                            initiator,
                            firstRow.get(qCallLog.isVideo),
                            firstRow.get(qCallLog.status),
                            firstRow.get(qCallLog.callStartedAt),
                            firstRow.get(qCallLog.callEndedAt));

                    List<CallParticipantViewDTO> participants = callLogData.stream()
                            .map(tuple -> new CallParticipantViewDTO(
                                    tuple.get(qParticipant.id),
                                    tuple.get(qParticipant.firstName),
                                    tuple.get(qParticipant.lastName),
                                    tuple.get(qCallParticipant.joinedAt),
                                    tuple.get(qCallParticipant.leftAt)))
                            .collect(Collectors.toList());

                    callLogViewDTO.setParticipants(participants);
                    return callLogViewDTO;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(callLogDTOs, pageable, totalCount);
    }

    private Long countCallLogsByUserId(Long userId) {
        Long count = queryFactory
                .select(qCallLog.id.countDistinct())
                .from(qCallLog)
                .join(qCallParticipant).on(qCallParticipant.callLog.eq(qCallLog))
                .where(qCallParticipant.participant.id.eq(userId))
                .fetchOne();

        return count != null ? count : 0L;
    }

    private List<Long> fetchPagedCallLogIds(Long userId, Pageable pageable) {
        return queryFactory
                .select(qCallLog.id)
                .from(qCallLog)
                .join(qCallParticipant).on(qCallParticipant.callLog.eq(qCallLog))
                .where(qCallParticipant.participant.id.eq(userId))
                .groupBy(qCallLog.id)
                .orderBy(
                        qCallLog.callStartedAt.max().desc(),
                        qCallLog.id.desc()
                )
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();
    }


    private List<Tuple> fetchCallLogDetailsByIds(List<Long> callLogIds) {
        return queryFactory
                .select(
                        qCallLog.id,
                        qCallLog.isVideo,
                        qCallLog.status,
                        qCallLog.callStartedAt,
                        qCallLog.callEndedAt,
                        qConversation.id,
                        qInitiator,
                        qParticipant.id,
                        qParticipant.firstName,
                        qParticipant.lastName,
                        qCallParticipant.joinedAt,
                        qCallParticipant.leftAt)
                .from(qCallLog)
                .join(qCallLog.conversation, qConversation)
                .join(qCallLog.initiator, qInitiator)
                .join(qCallParticipant).on(qCallParticipant.callLog.eq(qCallLog))
                .join(qCallParticipant.participant, qParticipant)
                .where(qCallLog.id.in(callLogIds))
                .fetch();
    }
}
