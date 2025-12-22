package com.platform.software.chat.conversation.repository;

import com.platform.software.chat.conversation.entity.ConversationInviteLink;

public interface ConversationInviteLinkQueryRepository {
    ConversationInviteLink findValidInviteLinkByToken(String token);
    void invalidateAllInviteLinksByConversationId(Long conversationId);
}
