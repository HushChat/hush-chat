package com.platform.software.platform.workspace.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceUserRoleUpdateDTO {
    @NotBlank
    @Email(message = "Email should be valid")
    private String email;
}
