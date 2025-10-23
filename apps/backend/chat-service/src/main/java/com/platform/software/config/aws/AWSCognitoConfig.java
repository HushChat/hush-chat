package com.platform.software.config.aws;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "aws.cognito")
public class AWSCognitoConfig {
    private String region;
    private String clientId;
    private String userPoolId;
    private String jwks;
}
