package com.platform.software.data.message;

import com.platform.software.BaseAccessTest;
import com.platform.software.chat.message.dto.MessageUpsertDTO;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.common.dto.PaginatedResponse;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import static com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum.MEMBER;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ConversationMessageControllerTest extends BaseAccessTest {
    private HttpHeaders headers;

    private String getBaseUrl(long conversationId) {
        return "/conversations/" + conversationId + "/messages";
    }

    private static final String SAMPLE_MESSAGE = "Hello from Skynet";
    private static final int CONVERSATION_ID_USER_IN = 3;
    private static final int CONVERSATION_ID_USER_NOT_IN = 7;
    private static final int CONVERSATION_ID_USER_IS_BLOCKED = 8;

    private static final int CONVERSATION_USER_IN_MESSAGE_ID = 11;
    private static final int CONVERSATION_USER_NOT_IN_MESSAGE_ID = 30;

    @BeforeAll
    public void setUp() {
        login();
        headers = authUtils.getHeaders(MEMBER);
    }

    @Test
    void test_getMessages_whenUserInConversation() {
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<PaginatedResponse<MessageViewDTO>> response = restTemplate.exchange(
                getBaseUrl(CONVERSATION_ID_USER_IN),
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );
        assertOk(response);
        assertPaginatedResponse(response.getBody());
        assertTrue(response.getBody().getContent().size() > 1, "Expected more than one message.");
    }

    @Test
    void test_getMessages_whenUserNotInConversation() {
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<PaginatedResponse<MessageViewDTO>> response = restTemplate.exchange(
                getBaseUrl(CONVERSATION_ID_USER_NOT_IN),
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );

        assertBadRequest(response);
    }

    @Test
    void test_sendMessage_whenUserInConversation() {
        MessageUpsertDTO messageUpsertDTO = new MessageUpsertDTO();
        messageUpsertDTO.setMessageText(SAMPLE_MESSAGE);

        HttpEntity<?> entity = new HttpEntity<>(messageUpsertDTO, headers);

        ResponseEntity<MessageViewDTO> response = restTemplate.exchange(
                getBaseUrl(CONVERSATION_ID_USER_IN),
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );

        assertOk(response);
        assertNotNull(response);
        assertTrue(response.getBody().getConversationId() == CONVERSATION_ID_USER_IN, "ConversationId mismatch");
        assertTrue(response.getBody().getMessageText().equals(SAMPLE_MESSAGE), "Message text mismatch");
    }

    @Test
    void test_sendMessage_whenUserNotInConversation() {
        MessageUpsertDTO messageUpsertDTO = new MessageUpsertDTO();
        messageUpsertDTO.setMessageText(SAMPLE_MESSAGE);

        HttpEntity<?> entity = new HttpEntity<>(messageUpsertDTO, headers);

        ResponseEntity<MessageViewDTO> response = restTemplate.exchange(
                getBaseUrl(CONVERSATION_ID_USER_NOT_IN),
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );

        assertBadRequest(response);
    }

    @Test
    void test_sendMessage_whenContactIsBlocked() {
        MessageUpsertDTO messageUpsertDTO = new MessageUpsertDTO();
        messageUpsertDTO.setMessageText(SAMPLE_MESSAGE);

        HttpEntity<?> entity = new HttpEntity<>(messageUpsertDTO, headers);

        ResponseEntity<MessageViewDTO> response = restTemplate.exchange(
                getBaseUrl(CONVERSATION_ID_USER_IS_BLOCKED),
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );

        assertBadRequest(response);
    }

    @Test
    void test_pinUnpinMessage_whenUserInConversation() {
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Void> response = restTemplate.exchange(
                getBaseUrl(CONVERSATION_ID_USER_IN) + "/" + CONVERSATION_USER_IN_MESSAGE_ID + "/pin",
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );

        assertOk(response);
    }

    @Test
    void test_pinUnpinMessage_whenUserNotInConversation() {
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Void> response = restTemplate.exchange(
                getBaseUrl(CONVERSATION_ID_USER_NOT_IN) + "/" + CONVERSATION_USER_NOT_IN_MESSAGE_ID + "/pin",
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<>() {
                }
        );

        assertBadRequest(response);
    }
}
