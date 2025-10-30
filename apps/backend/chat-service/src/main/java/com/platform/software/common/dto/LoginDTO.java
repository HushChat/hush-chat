package com.platform.software.common.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginDTO {
    @NotBlank
    private String email;

    @NotBlank
    private String password;
}
