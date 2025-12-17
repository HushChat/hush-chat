package com.platform.software.chat.conversation.readstatus.repository;

import com.platform.software.chat.conversation.readstatus.dto.ConversationReadInfo;
import com.platform.software.chat.user.dto.UserBasicViewDTO;
import com.platform.software.chat.user.entity.ChatUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;

public interface ConversationReadStatusQueryRepository {
    Optional<Long> findLastSeenMessageIdByConversationIdAndUserId(Long conversationId, Long userId);

    /**
     * Retrieves unread message counts for a list of conversations for a specific user.
     *
     * Calculates unread messages by comparing message IDs with the user's last read message
     * stored in ConversationReadStatus. Messages are considered unread if their ID is greater
     * than the last read message ID, or if no read status exists.
     *
     * Handled Scenarios:
     * - Never Read: No ConversationReadStatus exists → counts all non-unsent messages as unread
     * - Partially Read: ConversationReadStatus exists → counts only messages with ID > last read message ID
     * - Fully Read: Last read message is the latest → returns 0 unread count
     * - Empty Conversation: No messages exist → returns 0 unread count
     * - Unsent Messages: Messages with isUnsend=true are excluded from count
     *
     * Query uses LEFT JOINs to ensure all provided conversation IDs appear in results,
     * even if they have no read status or messages.
     *
     * @param conversationIds List of conversation IDs to check for unread messages
     * @param userId The user ID for whom to calculate unread counts
     * @return Map where key is conversation ID and value is the unread message count for that conversation
     */
    Map<Long, Long> findUnreadMessageCountsByConversationIdsAndUserId(
        Collection<Long> conversationIds, Long userId
    );

    /**
     * Retrieves conversation read status and unread message count for a single conversation.
     *
     * Returns both the ConversationReadStatus record (if exists) and the count of unread messages
     * for the specified conversation and user.
     *
     * @param conversationId The conversation ID to check
     * @param userId The user ID for whom to retrieve read info
     * @return ConversationReadInfo containing the read status and unread count
     */
    ConversationReadInfo findConversationReadInfoByConversationIdAndUserId(Long conversationId, Long userId);

    /**
     * Find last read message ids of participants by conversation id map.
     *
     * @param conversationId the conversation id
     * @return the map
     */
    Map<Long, Long> findLastReadMessageIdsByConversationId(Long conversationId);

    Page<ChatUser> findMessageSeenGroupParticipants(Long conversationId, Long messageId, Long userId, Pageable pageable);
}
