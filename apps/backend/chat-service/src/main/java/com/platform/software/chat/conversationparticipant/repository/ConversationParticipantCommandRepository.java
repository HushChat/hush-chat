package com.platform.software.chat.conversationparticipant.repository;

public interface ConversationParticipantCommandRepository {
    long toggleFavorite(Long conversationId, Long userId);
    long togglePinned(Long conversationId, Long userId);
    long toggleArchived(Long conversationId, Long userId);
}