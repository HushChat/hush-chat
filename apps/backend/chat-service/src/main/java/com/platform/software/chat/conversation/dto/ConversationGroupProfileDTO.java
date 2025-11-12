package com.platform.software.chat.conversation.dto;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantViewDTO;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
public class ConversationGroupProfileDTO {
     private ConversationViewDTO conversation;
     private boolean isFavorite;
     private boolean isPinned;
     private ZonedDateTime mutedUntil;
     private long participantCount;
     private boolean isAdmin;
     private boolean isActive;

     public ConversationGroupProfileDTO(
             Conversation conversation,
             ConversationParticipant participant,
             Page<ConversationParticipantViewDTO> conversationParticipants
     ){
        this.conversation = new ConversationViewDTO(conversation);
        this.conversation.setConversationParticipants(conversationParticipants);
        this.isFavorite = participant.getIsFavorite();
        this.isPinned = participant.getIsPinned();
        this.mutedUntil = participant.getMutedUntil();
        this.participantCount = conversationParticipants.getTotalElements();
        this.isAdmin = participant.getRole() == ConversationParticipantRoleEnum.ADMIN;
        this.isActive = participant.getIsActive();
     }
}