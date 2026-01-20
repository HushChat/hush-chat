package com.platform.software.chat.message.entity;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.message.attachment.entity.MessageAttachment;
import com.platform.software.chat.message.dto.MessageTypeEnum;
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
@Table(
        indexes = {
                @Index(
                        name = "idx_message_conversation_created",
                        columnList = "conversation_id, created_at DESC"
                ),
                @Index(
                        name = "idx_message_sender",
                        columnList = "sender_id"
                ),
                @Index(
                        name = "idx_message_parent",
                        columnList = "parent_message_id"
                ),
                @Index(
                        name = "idx_message_forwarded",
                        columnList = "forwarded_message_id"
                )
        }
)
public class Message extends AuditModel {
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
    @Column(name = "search_vector", columnDefinition = "tsvector")
    private String searchVector;

    @NotNull
    private Boolean isUnsend = false;

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MessageAttachment> attachments = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private MessageTypeEnum messageType;

    @NotNull
    @Column(name = "is_edited", nullable = false)
    private Boolean isEdited = false;
}