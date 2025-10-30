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

package com.platform.software.data.conversation;

import com.platform.software.BaseAccessTest;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantViewDTO;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.repository.ConversationParticipantRepository;
import com.platform.software.common.dto.PaginatedResponse;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum.MEMBER;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class ConversationControllerTest extends BaseAccessTest {
    private HttpHeaders headers;

    @Autowired
    private ConversationTestService conversationTestService;

    private static final String BASE_URL = "/conversations";

    private final int oneToOneConversationIdUserIn = 3;
    private final int groupConversationIdUserIn = 4;
    private final int conversationIdUserNotIn = 7;

    @BeforeAll
    public void setUp() {
        login();
        headers = authUtils.getHeaders(MEMBER);
    }

    @Test
    void test_favoriteUnfavoriteConversation_whenUserInConversation() {
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Boolean> response = restTemplate.exchange(
                BASE_URL + "/" + oneToOneConversationIdUserIn + "/favorite",
                HttpMethod.PATCH,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );
        assertOk(response);
        assertEquals(Boolean.TRUE, response.getBody(), "Response body should be true");
    }

    @Test
    void test_favoriteUnfavoriteConversation_whenUserNotInConversation() {
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<?> response = restTemplate.exchange(
                BASE_URL + "/" + conversationIdUserNotIn + "/favorite",
                HttpMethod.PATCH,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );
        assertBadRequest(response);
    }

    @Test
    void test_archiveUnarchiveConversation_whenUserInConversation() {
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Boolean> response = restTemplate.exchange(
                BASE_URL + "/" + oneToOneConversationIdUserIn + "/archive",
                HttpMethod.PATCH,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );
        assertNoContent(response);
    }

    @Test
    void test_archiveUnarchiveConversation_whenUserNotInConversation() {
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<?> response = restTemplate.exchange(
                BASE_URL + "/" + conversationIdUserNotIn + "/archive",
                HttpMethod.PATCH,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );
        assertBadRequest(response);
    }

    @Test
    void test_getChatParticipants_shouldMatchDatabaseRecords() {
        int page = 0;
        int size = 30;

        String url = BASE_URL + "/" + groupConversationIdUserIn + "/participants?page=" + page + "&size=" + size;

        HttpEntity<?> entity = new HttpEntity<>(headers);

        //Response from API
        ResponseEntity<PaginatedResponse<ConversationParticipantViewDTO>> apiResponse = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );

        // Records from Seed files
        List<ConversationParticipant> dbParticipants =
                conversationTestService.getSeededConversationParticipants((long) groupConversationIdUserIn);

        assertOk(apiResponse);
        assertNotNull(apiResponse.getBody());

        List<ConversationParticipantViewDTO> apiParticipants =
                apiResponse.getBody().getContent();

        // compare using sets of IDs to avoid order issues
        Set<Long> apiIds = apiParticipants.stream()
                .map(cp -> cp.getUser().getId())
                .collect(Collectors.toSet());

        Set<Long> dbIds = dbParticipants.stream()
                .map(cp -> cp.getUser().getId())
                .collect(Collectors.toSet());

        assertEquals(dbParticipants.size(), apiParticipants.size());
        assertEquals(dbIds, apiIds);
    }
}
