package com.platform.software;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.software.common.dto.PaginatedResponse;
import com.platform.software.utills.AuthUtils;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public abstract class BaseAccessTest extends TestcontainerTest {

    @Autowired
    protected TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    protected AuthUtils authUtils;

    protected void login() {
        authUtils.loginUsers();
    }

    protected void assertForbidden(ResponseEntity<?> response) {
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode(),
            "Expected status code FORBIDDEN, but got: " + response.getStatusCode());
    }

    protected void assertOk(ResponseEntity<?> response) {
        assertEquals(HttpStatus.OK, response.getStatusCode(),
                "Expected status code 200 OK, but got: " + response.getStatusCode());
    }

    protected void assertAccepted(ResponseEntity<?> response) {
        assertEquals(HttpStatus.ACCEPTED, response.getStatusCode(),
                "Expected status code 202 ACCEPTED, but got: " + response.getStatusCode());
    }

    protected void assertCreated(ResponseEntity<?> response) {
        assertEquals(HttpStatus.CREATED, response.getStatusCode(),
                "Expected status code 201 CREATED, but got: " + response.getStatusCode());
    }

    protected void assertNoContent(ResponseEntity<?> response) {
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode(),
                "Expected status code 204 NO_CONTENT, but got: " + response.getStatusCode());
    }

    protected void assertBadRequest(ResponseEntity<?> response) {
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode(),
                "Expected status code 400 BAD_REQUEST, but got: " + response.getStatusCode());
    }

    protected void assertInternalServerError(ResponseEntity<?> response) {
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode(),
                "Expected status code 500 INTERNAL_SERVER_ERROR, but got: " + response.getStatusCode());
    }

    protected <T> void assertNotEmpty(Collection<T> items, String message) {
        assertNotNull(items, message + " should not be null.");
        assertFalse(items.isEmpty(), message + " should contain at least one item.");
    }
     
    protected <T> void assertPaginatedResponse(PaginatedResponse<T> paginatedResponse) {
        List<T> content = paginatedResponse.getContent();
        assertNotNull(content,"Expected paginated response content to be not null, but it was null.");
        assertFalse(content.isEmpty(),"Expected paginated response content to not be empty, but it was empty.");
    }

    protected void assertUnauthorizedAccess(ResponseEntity<?> response) {
        String expectedMessage = "Unauthorized access!";
        assertForbidden(response);

        try {
            Map<String, Object> errorResponse = objectMapper.readValue(
                    response.getBody().toString(),
                    new TypeReference<Map<String, Object>>() {
                    });
            assertEquals(expectedMessage, errorResponse.get("message"));
        } catch (Exception e) {
            fail("Failed to parse error response: " + e.getMessage());
        }
    }

}