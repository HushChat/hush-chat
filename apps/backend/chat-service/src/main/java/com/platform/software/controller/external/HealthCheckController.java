package com.platform.software.controller.external;

import com.platform.software.config.logging.GitLoggingConfiguration;
import com.platform.software.more.seeder.SeederStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.data.redis.core.RedisTemplate;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.swagger.annotations.ApiOperation;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/health-check")
public class HealthCheckController {
    private static final Logger logger = LoggerFactory.getLogger(HealthCheckController.class);

    private final SeederStatus seederStatus;
    private final TemplateEngine templateEngine;
    private final GitLoggingConfiguration gitConfiguration;
    private final RedisTemplate<String, Object> redisTemplate;

    public HealthCheckController(
        SeederStatus seederStatus,
        TemplateEngine templateEngine,
        GitLoggingConfiguration gitConfiguration,
        @Nullable RedisTemplate<String, Object> redisTemplate
    ) {
        this.seederStatus = seederStatus;
        this.templateEngine = templateEngine;
        this.gitConfiguration = gitConfiguration;
        this.redisTemplate = redisTemplate;
    }

    RestTemplateBuilder restTemplateBuilder = new RestTemplateBuilder();

    @Value("${spring.datasource.url}")
    private String databaseUrl;

    @Value("${health-check.redis-status.secret-key}")
    private String redisStatusSecretKey;

    @Value("${health-check.commit-info.secret-key}")
    private String commitInfoSecretKey;

    @ApiOperation(value = "Get status", response = String.class)
    @GetMapping
    public ResponseEntity<String> getStatus(@RequestParam(required = false) String source) {
        return new ResponseEntity<>("success", HttpStatus.OK);
    }

    @ApiOperation(value = "Get seeding status", response = String.class)
    @GetMapping("seeder")
    public ResponseEntity<String> getSeedingStatus(@RequestParam(required = false) String source) {
        logger.info("health check invoked. source: {}", source);
        if (!seederStatus.isSeedingComplete()) {
            return new ResponseEntity<>("seeding in progress", HttpStatus.SERVICE_UNAVAILABLE);
        }
        return new ResponseEntity<>("success", HttpStatus.OK);
    }

    @ApiOperation(value = "Get egress URL response", response = String.class)
    @GetMapping("egress")
    public ResponseEntity<String> getEgressUrl(
            @RequestParam String url
    ) {
        try {
            RestTemplate restTemplate = restTemplateBuilder.build();
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to reach the specified URL: " + e.getMessage());
        }
    }

    @ApiOperation(value = "Get Redis status and keys", response = String.class)
    @GetMapping(value = "redis-status", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getRedisStatus(@RequestParam(required = true) String secretKey) {
        if (!redisStatusSecretKey.equals(secretKey)) {
            return ResponseEntity.ok("Provided key is invalid.");
        }
        Map<String, Object> model = new HashMap<>();
        String connectionStatus;
        Set<String> redisKeys;

        try {
            redisKeys = redisTemplate.keys("*");
            connectionStatus = "Redis connection successful. Ping response: pong";
            model.put("redisKeys", redisKeys != null ? redisKeys : Collections.emptySet());
        } catch (Exception e) {
            connectionStatus = "Redis connection failed: " + e.getMessage();
            model.put("redisKeys", Collections.emptySet());
        }

        model.put("connectionStatus", connectionStatus);
        Context context = new Context(Locale.getDefault(), model);
        String response = templateEngine.process("redis-status", context);

        return ResponseEntity.ok(response);
    }

    @GetMapping("commit")
    public ResponseEntity<Map<String, String>> getCommitInfo(
            @RequestParam(required = true) String secretKey
    ) {
        if (!commitInfoSecretKey.equals(secretKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Map<String, String> data = new LinkedHashMap<>();
        data.put("service", "main-service");
        data.put("commitId", gitConfiguration.getCommitId());
        data.put("commitMessage", gitConfiguration.getCommitMessage());
        data.put("databaseUrl", databaseUrl);

        return new ResponseEntity<>(data, HttpStatus.OK);
    }
}
