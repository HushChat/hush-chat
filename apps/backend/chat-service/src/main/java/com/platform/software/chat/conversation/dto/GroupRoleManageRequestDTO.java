package com.platform.software.chat.conversation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GroupRoleManageRequestDTO {

    @NotNull
    private Long userId;

    @NotNull
    private Boolean makeAdmin;
}
