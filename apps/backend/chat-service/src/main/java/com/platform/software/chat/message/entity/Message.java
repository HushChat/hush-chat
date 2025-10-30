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

package com.platform.software.chat.message.entity;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.message.attachment.entity.MessageAttachment;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.model.AuditModel;
import io.hypersistence.utils.hibernate.type.search.PostgreSQLTSVectorType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.Type;
import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
public class Message extends AuditModel{
    @Id
    @GeneratedValue(generator = "message_generator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private ChatUser sender;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @Column(columnDefinition = "TEXT")
    private String messageText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_message_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Message parentMessage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "forwarded_message_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Message forwardedMessage;
  
    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL)
    private List<FavouriteMessage> favouriteMessages;

    @Type(PostgreSQLTSVectorType.class)
    @Column(name = "search_vector",columnDefinition = "tsvector")
    private String searchVector;

    @NotNull
    private Boolean isUnsend = false;

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MessageAttachment> attachments = new ArrayList<>();
}