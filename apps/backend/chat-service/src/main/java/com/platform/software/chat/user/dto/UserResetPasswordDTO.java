package com.platform.software.chat.user.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class UserResetPasswordDTO {
    @NotEmpty
    private String oldPassword;

    @NotEmpty
    private String newPassword;

    @NotEmpty
    private String accessToken;
}
