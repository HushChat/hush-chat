package com.platform.software.chat.email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceFactory {

    @Value("${email.default.sender}")
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

    public boolean sendEmail(String toEmail , String subject, String content, String contentType, EmailProviderType provider) {
        EmailSenderService emailSenderService = getProvider(provider);
        emailSenderService.sendEmail(toEmail, subject, content, contentType);
        return true;
    }

    public boolean sendEmail(String toEmail, String senderEmail, String subject, String content, String contentType) {
        EmailSenderService emailSenderService = getProvider(EmailProviderType.valueOf(defaultSenderService));
        emailSenderService.sendEmail(toEmail, subject, content, contentType);
        return true;
    }
}
