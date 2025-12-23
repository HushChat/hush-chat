package com.platform.software.chat.user.entity;

import com.platform.software.chat.message.entity.FavouriteMessage;
import com.platform.software.chat.user.activitystatus.dto.UserStatusEnum;
import com.platform.software.common.model.AuditModel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;

import java.util.Set;


@Entity
@Setter
@Getter
// TODO: @Where(clause = "active = true AND deleted = false")
public class ChatUser extends AuditModel{

    @Id
    @GeneratedValue(generator = "chat_user_generator")
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String username;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    private String email;

    @NotNull
    private Boolean active = false;

    @NotNull
    private Boolean deleted = false;

    private String imageIndexedName;

    @Transient
    private String signedImageUrl;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<FavouriteMessage> favouriteMessages;

    @Enumerated(EnumType.STRING)
    private UserStatusEnum availabilityStatus = UserStatusEnum.AVAILABLE;
}
