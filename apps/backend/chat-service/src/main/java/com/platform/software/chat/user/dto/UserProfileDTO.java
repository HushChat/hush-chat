package com.platform.software.chat.user.dto;

import com.platform.software.chat.user.entity.ChatUserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String signedImageUrl;
    private String contactNumber;
    private String address;
    private String designation;
    private ChatUserStatus chatUserStatus;
}
