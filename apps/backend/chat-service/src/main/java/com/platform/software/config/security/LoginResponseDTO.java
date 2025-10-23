package com.platform.software.config.security;

import com.platform.software.platform.workspace.entity.Workspace;
import lombok.Builder;
import lombok.Data;
import software.amazon.awssdk.services.cognitoidentityprovider.model.ChallengeNameType;

import java.util.List;

@Data
@Builder
public class LoginResponseDTO {
    private String accessToken;
    private String session;
    private ChallengeNameType challengeNameType;
    private Integer expiresIn;
    private String tokenType;
    private String refreshToken;
    private String idToken;
    private String username;
    private String clientId;
    private String region;
    private String userPoolId;

    private List<Workspace> workspaces;
}
