package com.platform.software;

import org.testcontainers.containers.PostgreSQLContainer;

public class SharedPostgreSQLContainer {
    private static final PostgreSQLContainer<?> postgreSQLContainer = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("chat_system")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("schema.sql")
            .withReuse(true);

    static {
        postgreSQLContainer.start();
    }

    public static PostgreSQLContainer<?> getInstance() {
        return postgreSQLContainer;
    }
}
