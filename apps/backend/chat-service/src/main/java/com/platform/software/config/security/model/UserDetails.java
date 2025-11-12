package com.platform.software.config.security.model;

import com.platform.software.common.model.UserTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetails {
    private Long id;
    private String email;
    private UserTypeEnum userType;
    private String workspaceId;
}
