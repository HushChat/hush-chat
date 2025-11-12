package com.platform.software.more.seeder;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "seederservice")
public class SeederServiceConfig {
    private Boolean seed;
    private Boolean seedGenerated;
}
