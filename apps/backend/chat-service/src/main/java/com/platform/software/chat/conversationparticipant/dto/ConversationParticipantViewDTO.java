package com.platform.software.chat.conversationparticipant.dto;

import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum;
import com.platform.software.chat.user.dto.UserViewDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ConversationParticipantViewDTO {
    private Long id;
    private ConversationParticipantRoleEnum role;
    private UserViewDTO user;

    private Boolean isPinnedByParticipant;
    private Boolean isArchivedByParticipant;
    private Boolean isMutedByParticipant;
    private Boolean isFavoriteByParticipant;

    public ConversationParticipantViewDTO(ConversationParticipant conversationParticipant) {
        this.id = conversationParticipant.getId();
        this.role = conversationParticipant.getRole();
    }
}
