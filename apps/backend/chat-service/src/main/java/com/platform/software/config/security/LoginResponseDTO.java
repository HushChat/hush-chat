/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
