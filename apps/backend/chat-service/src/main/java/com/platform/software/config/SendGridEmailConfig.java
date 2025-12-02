package com.platform.software.config;

import com.sendgrid.SendGrid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SendGridEmailConfig {

    @Value("${email-service.sendgrid.api.key}")
    private String sendgridApiKey;

    @Bean
    public SendGrid sendGrid(){
        return new SendGrid(sendgridApiKey);
    }

}
