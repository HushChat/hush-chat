package com.platform.software.chat.user.dto;

import com.platform.software.chat.user.entity.ChatUser;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserBasicViewDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String signedImageUrl;

    public UserBasicViewDTO(ChatUser user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.signedImageUrl = user.getSignedImageUrl();
    }
}
