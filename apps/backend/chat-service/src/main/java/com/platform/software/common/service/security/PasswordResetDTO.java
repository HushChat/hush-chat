package com.platform.software.common.service.security;

import lombok.Data;

@Data
public class PasswordResetDTO {
    private String email;
    private String code;
    private String password;
    private String session;
}
