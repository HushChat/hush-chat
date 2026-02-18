package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.attachment.dto.MessageAttachmentDTO;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.user.dto.UserViewDTO;
import com.platform.software.config.aws.SignedURLDTO;
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
    private BasicMessageDTO originalForwardedMessage;
    private Boolean isUnsend;
    private Boolean isEdited;
    private String senderSignedImageUrl;
    private String imageIndexedName;
    private Boolean isReadByEveryone;
    private MessageTypeEnum messageType;
    private Boolean hasAttachment;
    private Boolean isMarkdownEnabled;
    private Boolean isIncludeUrlMetadata = false;
    private SignedURLDTO signedUrl;
    private Boolean isStored;

    public MessageViewDTO(Message message) {
        initializeFromMessage(message);

        Message parent = message.getParentMessage();
        if (parent != null && !message.getIsUnsend()) {
            this.parentMessage = new BasicMessageDTO(parent);
        }

        Message forwadedMessage = message.getForwardedMessage();
        if (forwadedMessage != null) {
            this.originalForwardedMessage = new BasicMessageDTO(forwadedMessage);
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
        this.imageIndexedName = message.getSender().getImageIndexedName();
        this.conversationId = message.getConversation().getId();
        this.isForwarded = message.getForwardedMessage() != null;
        this.isUnsend = message.getIsUnsend();
        this.isEdited = message.getIsEdited();
        this.messageType = message.getMessageType();
        this.isMarkdownEnabled = message.getIsMarkdownEnabled();
        this.isStored = message.getIsStored();
        this.hasAttachment = message.getAttachments() != null
            && !message.getAttachments().isEmpty();

        if (message.getIsUnsend()) {
            this.setMessageText("");
        } else {
            this.messageText = message.getMessageText();
        }
    }
}
