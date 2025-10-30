package com.platform.software.chat.conversation.dto;

import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.user.dto.UserViewDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationOneToOneProfileDTO {
    private UserViewDTO userView;
    private boolean isBlocked;
    private boolean isFavorite;
    private boolean isPinned;
    private ZonedDateTime mutedUntil;

    public ConversationOneToOneProfileDTO(ConversationParticipant conversationParticipant) {
        this.userView = new UserViewDTO(conversationParticipant.getUser());
        this.isFavorite = conversationParticipant.getIsFavorite();
        this.mutedUntil = conversationParticipant.getMutedUntil();
    }
}
