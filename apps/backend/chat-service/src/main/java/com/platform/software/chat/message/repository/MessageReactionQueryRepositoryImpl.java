/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package com.platform.software.chat.message.repository;

import com.platform.software.chat.message.dto.MessageReactionSummaryDTO;
import com.platform.software.chat.message.entity.QMessageReaction;
import com.platform.software.chat.message.entity.ReactionTypeEnum;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class MessageReactionQueryRepositoryImpl implements MessageReactionQueryRepository {

    private final JPAQueryFactory queryFactory;

    private static final QMessageReaction qMessageReaction = QMessageReaction.messageReaction;

    public MessageReactionQueryRepositoryImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }


    @Override
    public Map<Long, MessageReactionSummaryDTO> findReactionSummaryWithUserReactions(
            List<Long> messageIds,
            Long currentUserId
    ) {

        if (messageIds == null || messageIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<Long, MessageReactionSummaryDTO> messageReactionSummary = new HashMap<>();

        List<Tuple> countTuples = queryFactory
                .select(
                        qMessageReaction.message.id,
                        qMessageReaction.reactionType,
                        qMessageReaction.reactionType.count()
                )
                .from(qMessageReaction)
                .where(qMessageReaction.message.id.in(messageIds))
                .groupBy(qMessageReaction.message.id, qMessageReaction.reactionType)
                .fetch();

        applyReactionCounts(messageReactionSummary, countTuples);

        List<Tuple> userTuples = queryFactory
                .select(
                        qMessageReaction.message.id,
                        qMessageReaction.reactionType
                )
                .from(qMessageReaction)
                .where(
                        qMessageReaction.message.id.in(messageIds),
                        qMessageReaction.user.id.eq(currentUserId)
                )
                .fetch();

        applyUserReactions(messageReactionSummary, userTuples);

        return messageReactionSummary;
    }

    private void applyReactionCounts(Map<Long, MessageReactionSummaryDTO> messageReactionSummary, List<Tuple> countTuples) {
        for (Tuple tuple : countTuples) {
            Long messageId = tuple.get(qMessageReaction.message.id);
            ReactionTypeEnum reactionType = tuple.get(qMessageReaction.reactionType);
            Long count = tuple.get(qMessageReaction.reactionType.count());

            MessageReactionSummaryDTO messageReactionSummaryDTO = getOrCreateSummary(messageReactionSummary, tuple);
            messageReactionSummaryDTO.getCounts().put(reactionType, count);
        }
    }

    private void applyUserReactions(Map<Long, MessageReactionSummaryDTO> messageReactionSummary, List<Tuple> userTuples) {
        for (Tuple tuple : userTuples) {
            Long messageId = tuple.get(qMessageReaction.message.id);
            ReactionTypeEnum userReaction = tuple.get(qMessageReaction.reactionType);

            MessageReactionSummaryDTO messageReactionSummaryDTO = getOrCreateSummary(messageReactionSummary, tuple);
            messageReactionSummaryDTO.setCurrentUserReaction(userReaction);
        }
    }

    private MessageReactionSummaryDTO getOrCreateSummary(Map<Long, MessageReactionSummaryDTO> messageReactionSummary, Tuple tuple) {
        Long messageId = tuple.get(qMessageReaction.message.id);
        return messageReactionSummary.computeIfAbsent(messageId, id -> new MessageReactionSummaryDTO());
    }
}
