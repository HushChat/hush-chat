package com.platform.software.chat.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceFactory {

    private final Logger logger = LoggerFactory.getLogger(EmailServiceFactory.class);

    @Value("${email-service.default.sender}")
    private String defaultSenderService;

    @Value("${email-service.enabled}")
    private boolean isEnabled;

    private final EmailSenderService awsSesProvider;
    private final EmailSenderService sendGridProvider;

    public EmailServiceFactory(
            @Qualifier("awsSesProvider")EmailSenderService awsSesProvider,
            @Qualifier("sendGridProvider") EmailSenderService sendGridProvider
    ) {
        this.awsSesProvider = awsSesProvider;
        this.sendGridProvider = sendGridProvider;
    }

    private final EmailSenderService noopProvider =
            (to, subject, body, headers) -> logger.warn("Email service disabled. Skipping send.");


    private EmailSenderService getProvider(EmailProviderType providerType) {
        if (!isEnabled) {
            return noopProvider;
        }
        return switch (providerType) {
            case AWS_SES -> awsSesProvider;
            case SENDGRID -> sendGridProvider;
        };
    }

    public void sendEmail(String toEmail, String subject, String content, String contentType, EmailProviderType provider) {
        EmailSenderService emailSenderService = getProvider(provider);
        emailSenderService.sendEmail(toEmail, subject, content, contentType);
    }

    public void sendEmail(String toEmail, String subject, String content, String contentType) {
        EmailSenderService emailSenderService = getProvider(EmailProviderType.valueOf(defaultSenderService));
        emailSenderService.sendEmail(toEmail, subject, content, contentType);
    }
}
