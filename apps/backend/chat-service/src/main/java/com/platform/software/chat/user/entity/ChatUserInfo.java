package com.platform.software.chat.user.entity;

import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ChatUserInfo extends AuditModel {

    @Id
    @GeneratedValue(generator = "chat_user_info_generator")
    private Long id;

    @Column(length = 20)
    private String contactNumber;

    private String address;

    @Column(length = 100)
    private String designation;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "chat_user_id",
            nullable = false,
            unique = true
    )
    private ChatUser chatUser;
}
