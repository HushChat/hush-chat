package com.platform.software.chat.conversation.dto;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantViewDTO;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;


@Data
@NoArgsConstructor
public class ConversationViewDTO {
    private Long id;
    private String name;
    private Page<ConversationParticipantViewDTO> conversationParticipants;
    private String signedImageUrl;

    public ConversationViewDTO(Conversation conversation) {
        this.id = conversation.getId();
        this.name = conversation.getName();
        this.signedImageUrl = conversation.getSignedImageUrl();
    }
}
