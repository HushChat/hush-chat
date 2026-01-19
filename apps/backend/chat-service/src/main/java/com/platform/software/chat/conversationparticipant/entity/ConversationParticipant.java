package com.platform.software.chat.conversationparticipant.entity;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;

@Entity
@Setter
@Getter
@Table(uniqueConstraints = @UniqueConstraint(name = "UK_conversation_participant", columnNames = {"conversation_id", "user_id"}),
        indexes = {
                @Index(
                        name = "idx_cp_user_active",
                        columnList = "user_id, is_active"
                ),
                @Index(
                        name = "idx_cp_conversation_active",
                        columnList = "conversation_id, is_active"
                ),
                @Index(
                        name = "idx_cp_user_archived",
                        columnList = "user_id, archived"
                ),
                @Index(
                        name = "idx_cp_user_pinned",
                        columnList = "user_id, is_pinned"
                )
        })
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
    @Column(name = "is_active")
    private Boolean isActive = true;

    private ZonedDateTime inactiveFrom;

    private Boolean archived = false;

    private Boolean isFavorite = false;

    @Column(name = "is_pinned")
    private Boolean isPinned = false;

    private ZonedDateTime pinnedAt;

    private Boolean isDeleted = false;

    private ZonedDateTime lastDeletedTime = null;

    @Column(name = "notify_on_mentions_only")
    private Boolean notifyOnMentionsOnly = false;
}
