package com.platform.software.chat.conversation.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.platform.software.chat.user.entity.ChatUser;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class DirectOtherMetaDTO {
    private Long otherUserId;
    private String firstName;
    private String lastName;
    private String imageIndexedName;
    private boolean blocked;
    private String signedImageUrl;
    @JsonIgnore
    private String email;

    public DirectOtherMetaDTO(ChatUser otherUser, boolean blocked) {
        this.otherUserId = otherUser.getId();
        this.firstName = otherUser.getFirstName();
        this.lastName = otherUser.getLastName();
        this.imageIndexedName = otherUser.getImageIndexedName();
        this.blocked = blocked;
        this.signedImageUrl = otherUser.getSignedImageUrl();
        this.email = otherUser.getEmail();
    }

    public String getFullName() {
        String f = firstName == null ? "" : firstName;
        String l = lastName == null ? "" : lastName;
        String full = (f + " " + l).trim();
        return full.isEmpty() ? null : full;
    }
}