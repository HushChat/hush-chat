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

package com.platform.software.data.message;

import com.platform.software.BaseAccessTest;
import com.platform.software.chat.message.dto.MessageReactionUpsertDTO;
import com.platform.software.chat.message.entity.ReactionTypeEnum;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import static com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum.MEMBER;

class MessageControllerTest extends BaseAccessTest {
    private HttpHeaders headers;

    private static final String BASE_URL = "/messages";

    private static final int CONVERSATION_USER_IN_MESSAGE_ID = 11;
    private static final int CONVERSATION_USER_NOT_IN_MESSAGE_ID = 30;
    private static final int USER_NOT_SENDER_MESSAGE_ID = 10;

    @BeforeAll
    public void setUp() {
        login();
        headers = authUtils.getHeaders(MEMBER);
    }

    @Test
    void test_reactToMessage_whenUserInConversation() {
        MessageReactionUpsertDTO messageReactionUpsertDTO = new MessageReactionUpsertDTO();
        messageReactionUpsertDTO.setReactionType(ReactionTypeEnum.HAHA);

        HttpEntity<?> entity = new HttpEntity<>(messageReactionUpsertDTO, headers);

        ResponseEntity<Void> response = restTemplate.exchange(
                BASE_URL + "/" + CONVERSATION_USER_IN_MESSAGE_ID + "/reactions",
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );
        assertNoContent(response);
    }

    @Test
    void test_reactToMessage_whenUserNotInConversation() {
        MessageReactionUpsertDTO messageReactionUpsertDTO = new MessageReactionUpsertDTO();
        messageReactionUpsertDTO.setReactionType(ReactionTypeEnum.HAHA);

        HttpEntity<?> entity = new HttpEntity<>(messageReactionUpsertDTO, headers);

        ResponseEntity<Void> response = restTemplate.exchange(
                BASE_URL + "/" + CONVERSATION_USER_NOT_IN_MESSAGE_ID + "/reactions",
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );
        assertBadRequest(response);
    }

    @Test
    void test_removeReactToMessage_whenUserInConversation() {
        MessageReactionUpsertDTO messageReactionUpsertDTO = new MessageReactionUpsertDTO();
        messageReactionUpsertDTO.setReactionType(ReactionTypeEnum.HAHA);

        HttpEntity<?> entity = new HttpEntity<>(messageReactionUpsertDTO, headers);

        ResponseEntity<Void> response = restTemplate.exchange(
                BASE_URL + "/1/reactions",
                HttpMethod.DELETE,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );
        assertNoContent(response);
    }

    @Test
    void test_removeReactToMessage_whenUserNotInConversation() {
        MessageReactionUpsertDTO messageReactionUpsertDTO = new MessageReactionUpsertDTO();
        messageReactionUpsertDTO.setReactionType(ReactionTypeEnum.HAHA);

        HttpEntity<?> entity = new HttpEntity<>(messageReactionUpsertDTO, headers);

        ResponseEntity<Void> response = restTemplate.exchange(
                BASE_URL + "/" + CONVERSATION_USER_NOT_IN_MESSAGE_ID + "/reactions",
                HttpMethod.DELETE,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );
        assertBadRequest(response);
    }

    @Test
    void test_unsendMessage_whenUserIsSender(){
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Void> response = restTemplate.exchange(
                BASE_URL + "/" + CONVERSATION_USER_IN_MESSAGE_ID + "/unsend",
                HttpMethod.PATCH,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );

        assertOk(response);
    }

    @Test
    void test_unsendMessage_whenUserIsNotSender(){
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Void> response = restTemplate.exchange(
                BASE_URL + "/" + USER_NOT_SENDER_MESSAGE_ID + "/unsend",
                HttpMethod.PATCH,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );

        assertBadRequest(response);
    }

    @Test
    void test_unsendMessage_whenUserIsNotSenderAndNotParticipant(){
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Void> response = restTemplate.exchange(
                BASE_URL + "/" + CONVERSATION_USER_NOT_IN_MESSAGE_ID + "/unsend",
                HttpMethod.PATCH,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );

        assertBadRequest(response);
    }
}
