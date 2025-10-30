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
