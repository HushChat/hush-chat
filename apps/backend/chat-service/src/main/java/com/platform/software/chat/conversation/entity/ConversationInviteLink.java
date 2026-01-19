package com.platform.software.chat.conversation.entity;

import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
@Table(
        indexes = {
                @Index(
                        name = "idx_invite_conversation",
                        columnList = "conversation_id"
                ),
                @Index(
                        name = "idx_invite_active_expiry",
                        columnList = "is_active, expires_at"
                )
        }
)
public class ConversationInviteLink extends AuditModel {

    @Id
    @GeneratedValue(generator = "conversation_invite_link_generator")
    private Long id;

    //prevents concurrent updates
    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @Column(name = "token", nullable = false, unique = true, length = 64)
    private String token;

    @ManyToOne
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private ChatUser createdBy;

    @Column(name = "expires_at")
    private Date expiresAt;

    private Long maxUsers;

    private Long usedCount = 0L;

    @Column(name = "is_active")
    private boolean isActive;
}
