package com.platform.software;

import com.platform.software.common.constants.Constants;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;
import org.springframework.core.task.TaskExecutor;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.time.ZoneId;
import java.util.TimeZone;

@EnableConfigurationProperties
@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
@EnableScheduling
@EnableCaching
public class ChatService implements ApplicationListener<ApplicationReadyEvent> {
    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);
    private long applicationStartTime = System.currentTimeMillis();

    public static void main(String[] args) {
        SpringApplication.run(ChatService.class, args);
    }

    @PostConstruct
    public void init(){
        long startupTime = System.currentTimeMillis() - applicationStartTime;
        logger.info("postconstruct event called in {} seconds, after app startup", startupTime / 1000.0);

        TimeZone.setDefault(TimeZone.getTimeZone(ZoneId.of(Constants.TIME_ZONE_IST)));
    }

    @Bean
    public TaskExecutor taskExecutor() {
        // test comment for build 2
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        return executor;
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        long startupTime = System.currentTimeMillis() - applicationStartTime;
        logger.info("on application event called in {} seconds, after app startup", startupTime / 1000.0);
    }
}
