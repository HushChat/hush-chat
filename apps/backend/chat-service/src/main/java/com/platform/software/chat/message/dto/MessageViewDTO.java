/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.attachment.dto.MessageAttachmentDTO;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.user.dto.UserViewDTO;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
public class MessageViewDTO {
    private Long id;
    private Long senderId;
    private String senderFirstName;
    private String senderLastName;
    private String messageText;
    private Date createdAt;
    private List<UserViewDTO> mentions = new ArrayList<>();
    private Long conversationId;
    private Boolean isSeen = false;
    private List<MessageAttachmentDTO> messageAttachments;
    private MessageReactionSummaryDTO reactionSummary;
    private BasicMessageDTO parentMessage;
    private Boolean isForwarded;
    private Boolean isUnsend;

     public MessageViewDTO(Message message) {
        initializeFromMessage(message);

        Message parent = message.getParentMessage();
        if (parent != null && !message.getIsUnsend()) {
            this.parentMessage = new BasicMessageDTO(parent);
        }
    }

    public MessageViewDTO(Message message, Long lastSeenMessageId) {
        this(message);

        this.isSeen = lastSeenMessageId != null && message.getId() <= lastSeenMessageId;
    }

       public MessageViewDTO(Message message, boolean includeParent) {
        initializeFromMessage(message);

        Message parent = message.getParentMessage();
        if (includeParent && parent != null) {
            this.parentMessage = new BasicMessageDTO(parent);
        }
    }

    private void initializeFromMessage(Message message) {
        this.id = message.getId();
        this.messageText = message.getMessageText();
        this.createdAt = message.getCreatedAt();
        this.senderId = message.getSender().getId();
        this.senderFirstName = message.getSender().getFirstName();
        this.senderLastName = message.getSender().getLastName();
        this.conversationId = message.getConversation().getId();
        this.isForwarded = message.getForwardedMessage() != null;
        this.isUnsend = message.getIsUnsend();

        if (message.getIsUnsend()) {
            this.setMessageText("");
        } else {
            this.messageText = message.getMessageText();
        }
    }
}
