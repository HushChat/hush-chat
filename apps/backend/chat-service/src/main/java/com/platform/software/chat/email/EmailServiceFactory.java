package com.platform.software.chat.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceFactory {

    //@Value("email-service.default-sender-service")
    private String defaultSenderService;

    private final SESEmailSenderServiceImpl awsSesProvider;
    private final SendGridEmailSenderServiceImpl sendGridProvider;

    public EmailServiceFactory(SESEmailSenderServiceImpl awsSesProvider, SendGridEmailSenderServiceImpl sendGridProvider) {
        this.awsSesProvider = awsSesProvider;
        this.sendGridProvider = sendGridProvider;
    }

    private EmailSenderService getProvider(EmailProviderType providerType) {
        return switch (providerType) {
            case AWS_SES -> awsSesProvider;
            case SENDGRID -> sendGridProvider;
        };
    }

}
