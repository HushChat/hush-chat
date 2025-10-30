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

package com.platform.software.chat.conversationparticipant.entity;

import java.time.ZonedDateTime;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
@Table(uniqueConstraints = @UniqueConstraint(name = "UK_conversation_participant", columnNames = {"conversation_id", "user_id"}))
// TODO: remove @Where(clause = "is_active = true")
public class ConversationParticipant extends AuditModel {
    @Id
    @GeneratedValue(generator = "conversation_participant_generator")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ConversationParticipantRoleEnum role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    private ZonedDateTime mutedUntil;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private ChatUser user;

    @NotNull
    private Boolean isActive = true;

    private ZonedDateTime inactiveFrom;

    private Boolean archived = false;

    private Boolean isFavorite = false;

    private Boolean isPinned = false;

    private ZonedDateTime pinnedAt;

    private Boolean isDeleted = false;

    private ZonedDateTime lastDeletedTime = null;
}
