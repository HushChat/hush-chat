package com.platform.software.chat.user.dto;

import com.platform.software.chat.user.entity.ChatUser;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserUpsertDTO {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    private String email;

    @NotBlank(message = "password is required!")
    private String password;

    @NotBlank(message = "username is required!")
    @Pattern(
        regexp = "^[a-zA-Z0-9_]+$",
        message = "username must contain only letters, numbers, and underscores, no spaces or other special characters"
    )
    private String username;

    private String imageIndexedName;

    public ChatUser toChatUser() {
        ChatUser chatUser = new ChatUser();
        chatUser.setFirstName(this.getFirstName());
        chatUser.setLastName(this.getLastName());
        chatUser.setEmail(this.getEmail());
        chatUser.setUsername(this.getUsername());
        chatUser.setImageIndexedName(this.getImageIndexedName());
        return chatUser;
    }
}



