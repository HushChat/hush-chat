package com.platform.software.chat.conversation.repository;

import com.platform.software.chat.conversation.entity.ConversationInviteLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationInviteLinkRepository extends JpaRepository<ConversationInviteLink, Long>, ConversationInviteLinkQueryRepository {
}
