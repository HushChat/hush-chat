package com.platform.software.config.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import lombok.Getter;
import lombok.Setter;

@Configuration
@Getter
@Setter
@PropertySource("classpath:git.properties")
public class GitLoggingConfiguration {
    private static final Logger logger = LoggerFactory.getLogger(CommitInfoLogger.class);

    @Value("${git.commit.id.abbrev}")
    private String commitId;

    @Value("${git.commit.message.short}")
    private String commitMessage;

    @Component
    public class CommitInfoLogger {

        @EventListener(ApplicationReadyEvent.class)
        public void logCommitInfo() {
            logger.info("commit id: {}", commitId);
            logger.info("commit message: {}", commitMessage);
        }
    }
}
