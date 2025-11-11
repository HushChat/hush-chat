package com.platform.software.chat.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserUpsertDTO {

    @NotBlank
    private String email;

    @NotBlank(message = "password is required!")
    private String password;
}



