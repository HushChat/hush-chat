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

package com.platform.software.utills;

import com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.common.constants.Constants;
import com.platform.software.common.dto.LoginDTO;
import com.platform.software.exception.CustomBadRequestException;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum.ADMIN;
import static com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum.MEMBER;

@Component
public class AuthUtils {

    @Autowired
    protected UserService userService;

    //chat user details
    @Getter
    @Value("${unitTest.chat.user.participant.email}")
    private String testChatMemberEmail;

    @Getter
    @Value("${unitTest.chat.user.admin.email}")
    private String testChatAdminEmail;

    @Getter
    @Value("${unitTest.chat.user.participant.password}")
    private String testChatMemberPassword;

    @Getter
    @Value("${unitTest.chat.user.admin.password}")
    private String testChatAdminPassword;

    @Getter
    @Value("${unitTest.tenant.id}")
    private String tenantId;

    private Map<ConversationParticipantRoleEnum, String> userAccessTokens = new ConcurrentHashMap<>();

    public void loginUsers() {
        loginChatAdminUser(testChatAdminEmail, testChatAdminPassword);
        loginChatParticipantUser(testChatMemberEmail, testChatMemberPassword);
    }

    private void loginChatAdminUser(
            String userEmail, String password
    ) {
        if (!userAccessTokens.containsKey(ADMIN)) {
            LoginDTO loginDTO = new LoginDTO(userEmail, password);
            try {
                String accessToken = userService.authenticateUser(loginDTO).getIdToken();
                userAccessTokens.put(ADMIN, accessToken);
            } catch (Exception e) {
                throw new IllegalStateException("Login failed");
            }
        }
    }

    private void loginChatParticipantUser(
            String userEmail, String password
    ) {
        if (!userAccessTokens.containsKey(MEMBER)) {
            LoginDTO loginDTO = new LoginDTO(userEmail, password);
            try {
                String accessToken = userService.authenticateUser(loginDTO).getIdToken();
                userAccessTokens.put(MEMBER, accessToken);
            } catch (Exception e) {
                throw new IllegalStateException("Login failed");
            }
        }
    }

    public HttpHeaders getHeaders(ConversationParticipantRoleEnum type) {

        if (userAccessTokens.get(type) == null) {
            throw new CustomBadRequestException("User access token is null.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add(Constants.AUTHORIZATION_HEADER, Constants.BEARER_PREFIX + userAccessTokens.get(type));
        headers.add(Constants.X_TENANT_HEADER, tenantId);
        return headers;
    }
}
