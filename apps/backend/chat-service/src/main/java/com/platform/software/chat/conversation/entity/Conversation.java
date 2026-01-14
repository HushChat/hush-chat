package com.platform.software.chat.conversation.entity;

import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Setter
@Getter
@Table(
        indexes = {
                @Index(name = "idx_conversation_is_group", columnList = "is_group"),
                @Index(name = "idx_conversation_created_by", columnList = "created_by_id"),
                @Index(name = "idx_conversation_deleted", columnList = "deleted")
        }
)
public class Conversation extends AuditModel {
    @Id
    @GeneratedValue(generator = "conversation_generator")
    private Long id;

    private String name;

    @NotNull
    @Column(name = "is_group")
    private Boolean isGroup;

    private boolean deleted = false;

    @NotNull
    @Column(name = "is_self_conversation")
    private Boolean isSelfConversation = false;

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

    private ZonedDateTime pinnedMessageUntil;

    private String description;

    @Column(name = "only_admins_can_send_messages")
    private Boolean onlyAdminsCanSendMessages = false;
}
