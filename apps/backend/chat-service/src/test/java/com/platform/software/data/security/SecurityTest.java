package com.platform.software.data.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.software.BaseAccessTest;
import com.platform.software.common.constants.Constants;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum.MEMBER;
import static org.junit.jupiter.api.Assertions.*;

class SecurityTest extends BaseAccessTest {

    @Autowired
    private ObjectMapper objectMapper;

    private HttpHeaders authenticatedHeaders;

    private static final String CONVERSATIONS_URL = "/conversations";
    private static final String HEALTH_CHECK_URL = "/health-check";

    @BeforeAll
    public void setUp() {
        login();
        authenticatedHeaders = authUtils.getHeaders(MEMBER);
    }

    // ========== Helpers ==========

    private HttpHeaders authOnlyHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(Constants.AUTHORIZATION_HEADER,
                authenticatedHeaders.getFirst(Constants.AUTHORIZATION_HEADER));
        return headers;
    }

    private HttpHeaders authWithTenant(String tenantId) {
        HttpHeaders headers = authOnlyHeaders();
        headers.add(Constants.X_TENANT_HEADER, tenantId);
        return headers;
    }

    private ResponseEntity<String> get(String url, HttpHeaders headers) {
        return restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
    }

    private String errorMessage(ResponseEntity<String> response) {
        assertNotNull(response.getBody(), "Expected error response body but was null");
        try {
            Map<String, String> body = objectMapper.readValue(
                    response.getBody(), new TypeReference<>() {});
            return body.get("error");
        } catch (Exception e) {
            fail("Failed to parse error response: " + response.getBody());
            return null;
        }
    }

    private void assertWorkspaceIdMissing(ResponseEntity<String> response) {
        assertEquals(430, response.getStatusCode().value(),
                "Expected 430 (Workspace ID Missing), got: " + response.getStatusCode().value());
        assertEquals("workspace id missing", errorMessage(response));
    }

    // ========== Authentication Rejection ==========

    @Test
    void test_noAuthorizationHeader_returns401() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(Constants.X_TENANT_HEADER, authUtils.getTenantId());

        ResponseEntity<String> response = get(CONVERSATIONS_URL, headers);

        assertUnauthorized(response);
        assertEquals("jwt token missing", errorMessage(response));
    }

    @Test
    void test_nonBearerAuthorizationHeader_returns401() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(Constants.AUTHORIZATION_HEADER, "Basic dXNlcjpwYXNz");
        headers.add(Constants.X_TENANT_HEADER, authUtils.getTenantId());

        ResponseEntity<String> response = get(CONVERSATIONS_URL, headers);

        assertUnauthorized(response);
        assertEquals("jwt token missing", errorMessage(response));
    }

    @Test
    void test_invalidJwtToken_returns401() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(Constants.AUTHORIZATION_HEADER, Constants.BEARER_PREFIX + "invalid.jwt.token");
        headers.add(Constants.X_TENANT_HEADER, authUtils.getTenantId());

        ResponseEntity<String> response = get(CONVERSATIONS_URL, headers);

        assertUnauthorized(response);
        assertEquals("invalid token provided", errorMessage(response));
    }

    @Test
    void test_tamperedJwtToken_returns401() {
        String validAuthHeader = authenticatedHeaders.getFirst(Constants.AUTHORIZATION_HEADER);
        String tamperedToken = validAuthHeader + "tampered";

        HttpHeaders headers = new HttpHeaders();
        headers.add(Constants.AUTHORIZATION_HEADER, tamperedToken);
        headers.add(Constants.X_TENANT_HEADER, authUtils.getTenantId());

        ResponseEntity<String> response = get(CONVERSATIONS_URL, headers);

        assertUnauthorized(response);
        assertEquals("invalid token provided", errorMessage(response));
    }

    // ========== Workspace Isolation ==========

    @Test
    void test_validAuth_missingTenantHeader_returns430() {
        HttpHeaders headers = authOnlyHeaders();

        ResponseEntity<String> response = get(CONVERSATIONS_URL, headers);

        assertWorkspaceIdMissing(response);
    }

    @Test
    void test_validAuth_nonExistentTenant_returns430() {
        HttpHeaders headers = authWithTenant("non-existent-workspace");

        ResponseEntity<String> response = get(CONVERSATIONS_URL, headers);

        assertWorkspaceIdMissing(response);
    }

    @Test
    void test_validAuth_unauthorizedTenant_cannotAccessMessages() {
        HttpHeaders headers = authWithTenant("unauthorized-workspace-id");

        ResponseEntity<String> response = get("/conversations/3/messages", headers);

        assertWorkspaceIdMissing(response);
    }

    @Test
    void test_validAuth_crossTenantAccess_isRejected() {
        HttpHeaders headers = authWithTenant("other-company-workspace");

        ResponseEntity<String> response = get(CONVERSATIONS_URL, headers);

        assertWorkspaceIdMissing(response);
    }

    // ========== Public Endpoints ==========

    @Test
    void test_healthCheck_accessibleWithoutAuth() {
        ResponseEntity<String> response = get(HEALTH_CHECK_URL, new HttpHeaders());

        assertNotEquals(HttpStatus.UNAUTHORIZED.value(), response.getStatusCode().value(),
                "Health check should not require authentication");
        assertNotEquals(HttpStatus.FORBIDDEN.value(), response.getStatusCode().value(),
                "Health check should not be forbidden");
    }

    // ========== Sanity Check ==========

    @Test
    void test_validAuth_correctTenant_succeeds() {
        ResponseEntity<String> response = get(CONVERSATIONS_URL, authenticatedHeaders);

        assertOk(response);
    }
}
