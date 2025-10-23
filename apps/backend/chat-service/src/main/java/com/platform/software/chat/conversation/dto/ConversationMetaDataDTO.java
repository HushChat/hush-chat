package com.platform.software.chat.conversation.dto;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.message.dto.BasicMessageDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationMetaDataDTO {
    private Long id;
    private String name;
    private Boolean isGroup;
    private String imageIndexedName;
    private String signedImageUrl;
    private Boolean isBlocked;
    private Boolean isActive;
    private String description;
    private BasicMessageDTO pinnedMessage;

    public ConversationMetaDataDTO(Conversation conversation) {
        this.id = conversation.getId();
        this.name = conversation.getName();
        this.isGroup = conversation.getIsGroup();
        this.imageIndexedName = conversation.getImageIndexedName();
        this.isBlocked = false;
        this.description = conversation.getDescription();
        this.signedImageUrl = conversation.getSignedImageUrl();
    }
}
