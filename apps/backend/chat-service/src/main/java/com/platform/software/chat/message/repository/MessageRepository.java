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

    Optional<Message> findByConversation_IdAndIdAndSender_Id(Long conversationId, Long id, Long senderId);

    List<Message> findByIdIn(Collection<Long> ids);

    Optional<Message> findByIdAndSender_Id(Long id, Long senderId);

    @Query(value = """
            WITH RECURSIVE ancestors AS (
                -- Start with the clicked message
                SELECT id, parent_message_id
                FROM message
                WHERE id = :messageId

                UNION ALL

                -- Walk up to get all parent messages
                SELECT m.id, m.parent_message_id
                FROM message m
                INNER JOIN ancestors a ON m.id = a.parent_message_id
            ),
            descendants AS (
                -- Start with all ancestors (including the clicked message)
                SELECT id, parent_message_id
                FROM ancestors

                UNION ALL

                -- Walk down to get all child messages
                SELECT m.id, m.parent_message_id
                FROM message m
                INNER JOIN descendants d ON m.parent_message_id = d.id
            )
            SELECT DISTINCT m.*
            FROM message m
            WHERE m.id IN (SELECT id FROM descendants)
            ORDER BY m.created_at ASC
            """, nativeQuery = true)
    List<Message> getFullMessageThread(@Param("messageId") Long messageId);

    @Query(value = """
            SELECT m1_0.*
            FROM message m1_0
            WHERE m1_0.conversation_id = :conversationId
            AND (m1_0.created_at > :deletedAt)
            AND m1_0.search_vector @@ plainto_tsquery(:searchTerm)
            """, nativeQuery = true)
    List<Message> findBySearchTermAndConversationNative(@Param("searchTerm") String searchTerm,
            @Param("conversationId") Long conversationId, @Param("deletedAt") Date deletedAt);

    @Query(value = """
            SELECT
                m1_0.*,
                c1_0.id as conversation_db_id
            FROM message m1_0
            JOIN conversation c1_0 ON m1_0.conversation_id = c1_0.id
            JOIN conversation_participant cp1_0 ON c1_0.id = cp1_0.conversation_id
            WHERE m1_0.conversation_id IN :conversationIds
              AND cp1_0.user_id = :userId
              AND (cp1_0.last_deleted_time IS NULL OR m1_0.created_at > cp1_0.last_deleted_time)
              AND m1_0.search_vector @@ plainto_tsquery(:searchTerm)
            """, nativeQuery = true)
    Page<Message> findBySearchTermInConversations(
            @Param("searchTerm") String searchTerm,
            @Param("conversationIds") Collection<Long> conversationIds,
            @Param("userId") Long userId,
            Pageable pageable);
}