package com.platform.software.chat.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceFactory {

    Logger logger = LoggerFactory.getLogger(EmailServiceFactory.class);

    @Value("${email-service.default.sender}")
    private String defaultSenderService;

    @Value("${email-service.enabled}")
    private boolean isEnabled;

    private final SESEmailSenderServiceImpl awsSesProvider;
    private final SendGridEmailSenderServiceImpl sendGridProvider;

    public EmailServiceFactory(SESEmailSenderServiceImpl awsSesProvider, SendGridEmailSenderServiceImpl sendGridProvider) {
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

    public boolean sendEmail(String toEmail, String subject, String content, String contentType, EmailProviderType provider) {
        EmailSenderService emailSenderService = getProvider(provider);
        emailSenderService.sendEmail(toEmail, subject, content, contentType);
        return true;
    }

    public boolean sendEmail(String toEmail, String subject, String content, String contentType) {
        EmailSenderService emailSenderService = getProvider(EmailProviderType.valueOf(defaultSenderService));
        emailSenderService.sendEmail(toEmail, subject, content, contentType);
        return true;
    }
}
