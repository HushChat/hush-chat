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

package com.platform.software.chat.conversation.entity;

import java.util.List;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Where;

@Entity
@Setter
@Getter
// TODO: remove @Where(clause = "deleted = false")
public class Conversation extends AuditModel{
    @Id
    @GeneratedValue(generator = "conversation_generator")
    private Long id;

    private String name;

    @NotNull
    private Boolean isGroup;

    private boolean deleted = false;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private ChatUser createdBy;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "conversation_id")
    private List<ConversationParticipant> conversationParticipants;

    private String imageIndexedName;

    @Transient
    private String signedImageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pinned_message_id")
    private Message pinnedMessage;

    private String description;
}
