package com.platform.software.chat.conversation.dto;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantViewDTO;
import com.platform.software.chat.message.dto.MessageViewDTO;
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
    private boolean isFavoriteByLoggedInUser;
    private String imageIndexedName;
    private String signedImageUrl;
    private List<MessageViewDTO> messages;
    private List<ConversationParticipantViewDTO> participants;
    private String description;
    private boolean isPinnedByLoggedInUser;
    private boolean isMutedByLoggedInUser;

    public ConversationDTO(Conversation conversation) {
        this.mapToSelf(conversation);
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
    }
}
