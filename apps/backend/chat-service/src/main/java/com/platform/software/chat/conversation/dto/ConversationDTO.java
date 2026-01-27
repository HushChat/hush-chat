package com.platform.software.chat.conversation.dto;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantViewDTO;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.notification.entity.DeviceType;
import com.platform.software.chat.user.entity.ChatUserStatus;
import com.platform.software.common.model.ModelMapper;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class ConversationDTO implements ModelMapper<Conversation> {
    private Long id;
    private String name;
    private Boolean isGroup;
    private Date createdAt;
    private String imageIndexedName;
    private String signedImageUrl;
    private List<MessageViewDTO> messages;
    private List<ConversationParticipantViewDTO> participants;
    private String description;

    private boolean isPinnedByLoggedInUser;
    private boolean isArchivedByLoggedInUser;
    private boolean isMutedByLoggedInUser;
    private boolean isFavoriteByLoggedInUser;
    private ChatUserStatus chatUserStatus;
    private boolean onlyAdminsCanSendMessages;
    private DeviceType deviceType;

    private Long unreadCount;
    private boolean onlyAdminsCanPinMessages;

    public ConversationDTO(Conversation conversation) {
        this.mapToSelf(conversation);
    }

    // Shallow copy constructor
    public ConversationDTO(ConversationDTO other) {
        this.id = other.id;
        this.name = other.name;
        this.isGroup = other.isGroup;
        this.createdAt = other.createdAt;
        this.imageIndexedName = other.imageIndexedName;
        this.signedImageUrl = other.signedImageUrl;
        this.messages = other.messages; // shared reference
        this.participants = other.participants; // shared reference
        this.description = other.description;
        this.isPinnedByLoggedInUser = other.isPinnedByLoggedInUser;
        this.isArchivedByLoggedInUser = other.isArchivedByLoggedInUser;
        this.isMutedByLoggedInUser = other.isMutedByLoggedInUser;
        this.isFavoriteByLoggedInUser = other.isFavoriteByLoggedInUser;
        this.chatUserStatus = other.chatUserStatus;
        this.onlyAdminsCanSendMessages = other.onlyAdminsCanSendMessages;
        this.deviceType = other.deviceType;
        this.onlyAdminsCanPinMessages = other.onlyAdminsCanPinMessages;
    }

    @Override
    public Conversation getModel() {
        Conversation conversation = new Conversation();
        mapToModel(conversation);
        return conversation;
    }

    @Override
    public Conversation mapToModel(Conversation dao) {
        dao.setId(this.id);
        dao.setName(this.name);
        dao.setIsGroup(this.isGroup);
        dao.setImageIndexedName(this.imageIndexedName);
        dao.setDescription(this.description);
        dao.setSignedImageUrl(this.signedImageUrl);

        return dao;
    }

    @Override
    public void mapToSelf(Conversation dao) {
        this.id = dao.getId();
        this.name = dao.getName();
        this.isGroup = dao.getIsGroup();
        this.createdAt = dao.getCreatedAt();
        this.imageIndexedName = dao.getImageIndexedName();
        this.description = dao.getDescription();
        this.signedImageUrl = dao.getSignedImageUrl();
        this.onlyAdminsCanSendMessages = dao.getOnlyAdminsCanSendMessages();
        this.onlyAdminsCanPinMessages = dao.getOnlyAdminsCanPinMessages();
    }
}