package com.platform.software.config.aws;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import lombok.Getter;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;

@Configuration
@PropertySource("classpath:application.properties")
@Getter
public class AWSconfig {
    Logger logger = LoggerFactory.getLogger(AWSconfig.class);


    public AWSconfig() {}

    @Value("${aws.cognito.region}")
    private String awsRegion;

    @Value("${cloud.aws.credentials.accessKey}")
    private String awsAccessKey;

    @Value("${cloud.aws.credentials.secretKey}")
    private String awsSecretKey;

    @Bean
    public CognitoIdentityProviderClient cognitoClient() {
        return CognitoIdentityProviderClient.builder()
            .region(Region.of(awsRegion))
            .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(awsAccessKey, awsSecretKey)))
            .build();
    }

    @Bean
    public AmazonSQS amazonSQS() {
        return AmazonSQSClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(
                    new BasicAWSCredentials(awsAccessKey, awsSecretKey)))
                .withRegion(awsRegion)
                .build();
    }
}