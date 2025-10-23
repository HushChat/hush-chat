package com.platform.software.chat.conversation.repository;

import com.platform.software.chat.conversation.dto.ChatSummaryDTO;
import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversation.dto.ConversationFilterCriteriaDTO;
import com.platform.software.chat.conversation.dto.ConversationMetaDataDTO;
import com.platform.software.chat.conversation.dto.DirectOtherMetaDTO;
import com.platform.software.chat.conversation.entity.Conversation;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface ConversationQueryRepository {
    Optional<Conversation> findDirectConversationBetweenUsers(Long userId1, Long userId2);
    
    ChatSummaryDTO getChatSummaryForUser(Long userId);

    Page<ConversationDTO> findAllConversationsByUserIdWithLatestMessages(Long userId, ConversationFilterCriteriaDTO conversationFilterCriteria, Pageable pageable);

    ConversationParticipant getOtherParticipantInOneToOneConversationOrThrow(Long conversationId, Long userId);

    List<Conversation> getOneToOneConversationsForCurrentUser(Long userId);

    ConversationMetaDataDTO findConversationMetaData(Long conversationId, Long userId);

    boolean getIsActiveByConversationIdAndUserId(Long conversationId, Long userId);

    Optional<DirectOtherMetaDTO> findDirectOtherMeta(Long conversationId, Long userId);

    Map<Long, Long> findDirectConversationsBatch(Long loggedInUserId, List<Long> targetUserIds);

}
