package com.platform.software;

import com.platform.software.config.workspace.WorkspaceContext;
import org.junit.jupiter.api.BeforeAll;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("${spring.profiles.active}")
@Testcontainers
public abstract class TestcontainerTest {

    static final PostgreSQLContainer<?> postgreSQLContainer = SharedPostgreSQLContainer.getInstance();
    static final GenericContainer<?> redisContainer = SharedRedisContainer.getInstance();

    @DynamicPropertySource
    static void registerPgProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> postgreSQLContainer.getJdbcUrl());
        registry.add("spring.datasource.username", () -> postgreSQLContainer.getUsername());
        registry.add("spring.datasource.password", () -> postgreSQLContainer.getPassword());

        registry.add("spring.datasource.default.schema", () -> "localhost");

         // Redis properties
         registry.add("spring.data.redis.host", () -> redisContainer.getHost());
         registry.add("spring.data.redis.port", () -> redisContainer.getMappedPort(6379));
    }

    @BeforeAll
    static void setUpTenantContext() {
        WorkspaceContext.setCurrentWorkspace("localhost");
    }
}
