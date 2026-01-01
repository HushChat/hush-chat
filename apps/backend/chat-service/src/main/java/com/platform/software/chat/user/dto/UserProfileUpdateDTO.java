package com.platform.software.chat.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileUpdateDTO {
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String contactNumber;
    private String address;
    private String designation;
}
