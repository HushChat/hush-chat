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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.platform.software.chat.message.entity.Message;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long>, MessageQueryRepository {

    Optional<Message> findByConversation_IdAndIdAndConversationDeletedFalse(Long conversationId, Long id);

    Optional<Message> findByConversation_IdAndId(Long conversationId, Long id);

    List<Message> findByIdIn(Collection<Long> ids);

    Optional<Message> findByIdAndSender_Id(Long id, Long senderId);

    public interface MessageThreadProjection {
        Long getId();
        String getMessageText();
        Date getCreatedAt();
        Long getParentMessageId();
        Long getSenderId();
        String getSenderFirstName();
        String getSenderLastName();
        Integer getLevel();
    }

    @Query(value = """
        WITH RECURSIVE parent_chain AS (
            -- anchor
            SELECT m.id, m.message_text, m.created_at, m.parent_message_id, m.sender_id,
                   cu.first_name, cu.last_name, 0 AS level
            FROM message m
            LEFT JOIN chat_user cu ON m.sender_id = cu.id
            WHERE m.id = :messageId
            
            UNION ALL
            
            -- recursive
            SELECT m.id, m.message_text, m.created_at, m.parent_message_id, m.sender_id,
                   cu.first_name, cu.last_name, pc.level + 1
            FROM message m
            LEFT JOIN chat_user cu ON m.sender_id = cu.id
            INNER JOIN parent_chain pc ON m.id = pc.parent_message_id
        )
        SEARCH DEPTH FIRST BY id SET ordercol
        CYCLE id SET is_cycle TO true DEFAULT false USING cycle_path
        SELECT id, message_text AS messageText, created_at AS createdAt,
               parent_message_id AS parentMessageId, sender_id AS senderId,
               first_name AS senderFirstName, last_name AS senderLastName, level
        FROM parent_chain
        WHERE NOT is_cycle
        ORDER BY level ASC
        """, nativeQuery = true)
    List<MessageThreadProjection> getMessageWithParentChain(@Param("messageId") Long messageId);

    @Query(value = "select m1_0.* from message m1_0 where m1_0.conversation_id = :conversationId and m1_0.search_vector @@ plainto_tsquery(:searchTerm)", nativeQuery = true)
    List<Message> findBySearchTermAndConversationNative(@Param("searchTerm") String searchTerm, @Param("conversationId") Long conversationId);

    @Query(value = """
        select
            m1_0.*,
            c1_0.id as conversation_db_id
        from message m1_0
        join conversation c1_0 on m1_0.conversation_id = c1_0.id
        where m1_0.conversation_id in :conversationIds
        and m1_0.search_vector @@ plainto_tsquery(:searchTerm)
        """, nativeQuery = true)
    Page<Message> findBySearchTermInConversations(
        @Param("searchTerm") String searchTerm,
        @Param("conversationIds") Collection<Long> conversationIds,
        Pageable pageable
    );
}