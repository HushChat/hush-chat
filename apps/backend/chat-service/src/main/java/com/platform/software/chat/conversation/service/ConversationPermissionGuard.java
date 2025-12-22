package com.platform.software.chat.conversation.service;

import org.springframework.stereotype.Component;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum;
import com.platform.software.exception.CustomBadRequestException;

@Component
public class ConversationPermissionGuard {

    public void validateMessageSendingAccess(Conversation conversation, ConversationParticipant participant) {
        if (Boolean.TRUE.equals(conversation.getOnlyAdminsCanSendMessages())) {
            if (participant.getRole() != ConversationParticipantRoleEnum.ADMIN) {
                throw new CustomBadRequestException("Only admins can send messages in this conversation");
            }
        }
    }
}
