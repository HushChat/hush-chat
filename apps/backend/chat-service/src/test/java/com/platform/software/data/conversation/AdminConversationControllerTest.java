package com.platform.software.data.conversation;

import com.platform.software.BaseAccessTest;
import com.platform.software.chat.conversation.dto.GroupAdminListDTO;
import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.repository.ConversationRepository;
import com.platform.software.chat.message.dto.MessageUpsertDTO;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.common.dto.PaginatedResponse;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum.ADMIN;
import static com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum.MEMBER;
import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AdminConversationControllerTest extends BaseAccessTest {

    private HttpHeaders adminHeaders;
    private HttpHeaders memberHeaders;

    @Autowired
    private ConversationRepository conversationRepository;

    private static final String BASE_URL = "/admin/conversations";

    // Seed data: groups are conversations 1, 2, 4, 5 (4 groups total)
    // Conversation 4 = "Engineering Squad" — admin user (User 1) is a MEMBER participant
    private static final long GROUP_CONVERSATION_ID = 4;
    // Conversation 3 is a one-to-one (not a group)
    private static final long ONE_TO_ONE_CONVERSATION_ID = 3;
    // Total group count from seed data
    private static final int TOTAL_GROUP_COUNT = 4;

    @BeforeAll
    public void setUp() {
        login();
        adminHeaders = authUtils.getHeaders(ADMIN);
        memberHeaders = authUtils.getHeaders(MEMBER);
    }

    // =====================================================
    // GET /admin/conversations/groups — List groups
    // =====================================================

    @Test
    @Order(1)
    void test_getAdminGroupsList_asAdmin_shouldReturnAllGroups() {
        HttpEntity<?> entity = new HttpEntity<>(adminHeaders);

        ResponseEntity<PaginatedResponse<GroupAdminListDTO>> response = restTemplate.exchange(
                BASE_URL + "/groups?page=0&size=20",
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<>() {}
        );

        assertOk(response);
        assertNotNull(response.getBody());

        List<GroupAdminListDTO> groups = response.getBody().getContent();
        assertNotNull(groups);
        assertEquals(TOTAL_GROUP_COUNT, groups.size(), "Should return all 4 seeded group conversations");

        // Verify each group has required fields
        for (GroupAdminListDTO group : groups) {
            assertNotNull(group.getId(), "Group ID should not be null");
            assertNotNull(group.getName(), "Group name should not be null");
            assertNotNull(group.getDisabled(), "Disabled field should not be null");
            assertNull(group.getImageIndexedName(), "imageIndexedName should be null (hidden from response)");
        }
    }

    @Test
    @Order(2)
    void test_getAdminGroupsList_asMember_shouldBeUnauthorized() {
        HttpEntity<?> entity = new HttpEntity<>(memberHeaders);

        ResponseEntity<?> response = restTemplate.exchange(
                BASE_URL + "/groups?page=0&size=20",
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<>() {}
        );

        assertTrue(
                response.getStatusCode().isError(),
                "Non-admin users should not be able to access admin groups list"
        );
    }

    @Test
    @Order(3)
    void test_getAdminGroupsList_withKeywordSearch_shouldFilterResults() {
        HttpEntity<?> entity = new HttpEntity<>(adminHeaders);

        ResponseEntity<PaginatedResponse<GroupAdminListDTO>> response = restTemplate.exchange(
                BASE_URL + "/groups?keyword=Engineering&page=0&size=20",
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<>() {}
        );

        assertOk(response);
        assertNotNull(response.getBody());

        List<GroupAdminListDTO> groups = response.getBody().getContent();
        assertEquals(1, groups.size(), "Should return only 'Engineering Squad'");
        assertTrue(groups.get(0).getName().contains("Engineering"), "Result should contain 'Engineering'");
    }

    @Test
    @Order(4)
    void test_getAdminGroupsList_withNonMatchingKeyword_shouldReturnEmpty() {
        HttpEntity<?> entity = new HttpEntity<>(adminHeaders);

        ResponseEntity<PaginatedResponse<GroupAdminListDTO>> response = restTemplate.exchange(
                BASE_URL + "/groups?keyword=NonExistentGroup&page=0&size=20",
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<>() {}
        );

        assertOk(response);
        assertNotNull(response.getBody());

        List<GroupAdminListDTO> groups = response.getBody().getContent();
        assertTrue(groups.isEmpty(), "Should return no results for non-matching keyword");
    }

    @Test
    @Order(5)
    void test_getAdminGroupsList_pagination_shouldRespectPageSize() {
        HttpEntity<?> entity = new HttpEntity<>(adminHeaders);

        ResponseEntity<PaginatedResponse<GroupAdminListDTO>> response = restTemplate.exchange(
                BASE_URL + "/groups?page=0&size=2",
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<>() {}
        );

        assertOk(response);
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getContent().size(), "Should return only 2 groups per page");
        assertEquals(TOTAL_GROUP_COUNT, response.getBody().getTotalElements(), "Total elements should be all groups");
    }

    @Test
    @Order(6)
    void test_getAdminGroupsList_allGroupsDisabledByDefault() {
        HttpEntity<?> entity = new HttpEntity<>(adminHeaders);

        ResponseEntity<PaginatedResponse<GroupAdminListDTO>> response = restTemplate.exchange(
                BASE_URL + "/groups?page=0&size=20",
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<>() {}
        );

        assertOk(response);
        List<GroupAdminListDTO> groups = response.getBody().getContent();
        for (GroupAdminListDTO group : groups) {
            assertFalse(group.getDisabled(), "All groups should be enabled (disabled=false) by default");
        }
    }

    // =====================================================
    // PATCH /admin/conversations/groups/{id}/disabled — Toggle disabled
    // =====================================================

    @Test
    @Order(10)
    void test_toggleGroupDisabled_asAdmin_shouldDisableGroup() {
        Map<String, Boolean> body = Map.of("disabled", true);
        HttpEntity<?> entity = new HttpEntity<>(body, adminHeaders);

        ResponseEntity<Void> response = restTemplate.exchange(
                BASE_URL + "/groups/" + GROUP_CONVERSATION_ID + "/disabled",
                HttpMethod.PATCH,
                entity,
                new ParameterizedTypeReference<>() {}
        );

        assertNoContent(response);

        // Verify in DB
        Optional<Conversation> conversation = conversationRepository.findById(GROUP_CONVERSATION_ID);
        assertTrue(conversation.isPresent());
        assertTrue(conversation.get().getDisabled(), "Group should be disabled in the database");
    }

    @Test
    @Order(11)
    void test_toggleGroupDisabled_asAdmin_shouldEnableGroup() {
        Map<String, Boolean> body = Map.of("disabled", false);
        HttpEntity<?> entity = new HttpEntity<>(body, adminHeaders);

        ResponseEntity<Void> response = restTemplate.exchange(
                BASE_URL + "/groups/" + GROUP_CONVERSATION_ID + "/disabled",
                HttpMethod.PATCH,
                entity,
                new ParameterizedTypeReference<>() {}
        );

        assertNoContent(response);

        // Verify in DB
        Optional<Conversation> conversation = conversationRepository.findById(GROUP_CONVERSATION_ID);
        assertTrue(conversation.isPresent());
        assertFalse(conversation.get().getDisabled(), "Group should be enabled in the database");
    }

    @Test
    @Order(12)
    void test_toggleGroupDisabled_asMember_shouldBeUnauthorized() {
        Map<String, Boolean> body = Map.of("disabled", true);
        HttpEntity<?> entity = new HttpEntity<>(body, memberHeaders);

        ResponseEntity<?> response = restTemplate.exchange(
                BASE_URL + "/groups/" + GROUP_CONVERSATION_ID + "/disabled",
                HttpMethod.PATCH,
                entity,
                new ParameterizedTypeReference<>() {}
        );

        assertTrue(
                response.getStatusCode().isError(),
                "Non-admin users should not be able to toggle group disabled status"
        );
    }

    @Test
    @Order(13)
    void test_toggleGroupDisabled_onOneToOneConversation_shouldBeBadRequest() {
        Map<String, Boolean> body = Map.of("disabled", true);
        HttpEntity<?> entity = new HttpEntity<>(body, adminHeaders);

        ResponseEntity<?> response = restTemplate.exchange(
                BASE_URL + "/groups/" + ONE_TO_ONE_CONVERSATION_ID + "/disabled",
                HttpMethod.PATCH,
                entity,
                new ParameterizedTypeReference<>() {}
        );

        assertBadRequest(response);
    }

    @Test
    @Order(14)
    void test_toggleGroupDisabled_nonExistentConversation_shouldFail() {
        Map<String, Boolean> body = Map.of("disabled", true);
        HttpEntity<?> entity = new HttpEntity<>(body, adminHeaders);

        ResponseEntity<?> response = restTemplate.exchange(
                BASE_URL + "/groups/99999/disabled",
                HttpMethod.PATCH,
                entity,
                new ParameterizedTypeReference<>() {}
        );

        // Should return 400 or 404 (depending on how getConversationOrThrow handles it)
        assertTrue(
                response.getStatusCode().is4xxClientError(),
                "Should return a 4xx error for non-existent conversation"
        );
    }

    // =====================================================
    // Disabled group blocks message sending
    // =====================================================

    @Test
    @Order(20)
    void test_sendMessage_toDisabledGroup_shouldBeBlocked() {
        // First, disable the group as admin
        Map<String, Boolean> disableBody = Map.of("disabled", true);
        HttpEntity<?> disableEntity = new HttpEntity<>(disableBody, adminHeaders);
        ResponseEntity<Void> disableResponse = restTemplate.exchange(
                BASE_URL + "/groups/" + GROUP_CONVERSATION_ID + "/disabled",
                HttpMethod.PATCH,
                disableEntity,
                new ParameterizedTypeReference<>() {}
        );
        assertNoContent(disableResponse);

        // Now try to send a message as a member participant in that group
        // User 1 (admin workspace user) is a MEMBER participant in conversation 4
        MessageUpsertDTO messageDTO = new MessageUpsertDTO();
        messageDTO.setMessageText("This message should be blocked");

        HttpEntity<?> messageEntity = new HttpEntity<>(messageDTO, adminHeaders);
        ResponseEntity<?> messageResponse = restTemplate.exchange(
                "/conversations/" + GROUP_CONVERSATION_ID + "/messages",
                HttpMethod.POST,
                messageEntity,
                new ParameterizedTypeReference<>() {}
        );

        assertBadRequest(messageResponse);
    }

    @Test
    @Order(21)
    void test_sendMessage_afterReEnablingGroup_shouldSucceed() {
        // Re-enable the group
        Map<String, Boolean> enableBody = Map.of("disabled", false);
        HttpEntity<?> enableEntity = new HttpEntity<>(enableBody, adminHeaders);
        ResponseEntity<Void> enableResponse = restTemplate.exchange(
                BASE_URL + "/groups/" + GROUP_CONVERSATION_ID + "/disabled",
                HttpMethod.PATCH,
                enableEntity,
                new ParameterizedTypeReference<>() {}
        );
        assertNoContent(enableResponse);

        // Now sending a message should succeed
        MessageUpsertDTO messageDTO = new MessageUpsertDTO();
        messageDTO.setMessageText("This message should go through");

        HttpEntity<?> messageEntity = new HttpEntity<>(messageDTO, adminHeaders);
        ResponseEntity<MessageViewDTO> messageResponse = restTemplate.exchange(
                "/conversations/" + GROUP_CONVERSATION_ID + "/messages",
                HttpMethod.POST,
                messageEntity,
                new ParameterizedTypeReference<>() {}
        );

        assertOk(messageResponse);
        assertNotNull(messageResponse.getBody());
        assertEquals("This message should go through", messageResponse.getBody().getMessageText());
    }

    // =====================================================
    // Verify disabled status is reflected in group list
    // =====================================================

    @Test
    @Order(30)
    void test_getAdminGroupsList_reflectsDisabledStatus() {
        // Disable a group
        Map<String, Boolean> disableBody = Map.of("disabled", true);
        HttpEntity<?> disableEntity = new HttpEntity<>(disableBody, adminHeaders);
        restTemplate.exchange(
                BASE_URL + "/groups/" + GROUP_CONVERSATION_ID + "/disabled",
                HttpMethod.PATCH,
                disableEntity,
                new ParameterizedTypeReference<Void>() {}
        );

        // Fetch groups list and verify disabled status
        HttpEntity<?> listEntity = new HttpEntity<>(adminHeaders);
        ResponseEntity<PaginatedResponse<GroupAdminListDTO>> response = restTemplate.exchange(
                BASE_URL + "/groups?page=0&size=20",
                HttpMethod.GET,
                listEntity,
                new ParameterizedTypeReference<>() {}
        );

        assertOk(response);
        List<GroupAdminListDTO> groups = response.getBody().getContent();

        GroupAdminListDTO disabledGroup = groups.stream()
                .filter(g -> g.getId().equals(GROUP_CONVERSATION_ID))
                .findFirst()
                .orElse(null);

        assertNotNull(disabledGroup, "Disabled group should appear in the list");
        assertTrue(disabledGroup.getDisabled(), "Group should show as disabled in the list");

        // Clean up: re-enable the group
        Map<String, Boolean> enableBody = Map.of("disabled", false);
        HttpEntity<?> enableEntity = new HttpEntity<>(enableBody, adminHeaders);
        restTemplate.exchange(
                BASE_URL + "/groups/" + GROUP_CONVERSATION_ID + "/disabled",
                HttpMethod.PATCH,
                enableEntity,
                new ParameterizedTypeReference<Void>() {}
        );
    }
}
