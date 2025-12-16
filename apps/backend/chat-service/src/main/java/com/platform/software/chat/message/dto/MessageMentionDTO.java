package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.entity.MessageMention;
import com.platform.software.chat.user.dto.UserViewDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MessageMentionDTO {
    private Long id;
    private BasicMessageDTO message;
    private UserViewDTO mentionedUser;

    public MessageMentionDTO(MessageMention messageMention) {
        this.id = messageMention.getId();
        this.message = new BasicMessageDTO(messageMention.getMessage());
        this.mentionedUser = new UserViewDTO(messageMention.getMentionedUser());
    }
}
