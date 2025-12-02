package com.platform.software.chat.email;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Arrays;

@Service("sendGridProvider")
class SendGridEmailSenderServiceImpl implements EmailSenderService {

    private final Logger logger = LoggerFactory.getLogger(SendGridEmailSenderServiceImpl.class);

    @Value("${email-service.sendgrid.from-mail}")
    private String fromEmail;

    private final SendGrid sendGrid;

    private static final String SENDGRID_ENDPOINT = "mail/send";

    SendGridEmailSenderServiceImpl(SendGrid sendGrid) {
        this.sendGrid = sendGrid;
    }

    @Override
    @Async
    public void sendEmail(String to, String subject, String content, String contentType) {
        Email fromEmail = new Email(this.fromEmail);
        Email toEmail = new Email(to);
        Content mailBody = new Content(contentType, content);
        Mail mail = new Mail(fromEmail, subject, toEmail, mailBody);

        Request request = new Request();

        request.setMethod(Method.POST);
        request.setEndpoint(SENDGRID_ENDPOINT);

        try {
            request.setBody(mail.build());
            Response response = sendGrid.api(request);
            if (response.getStatusCode() != 202) {
                logger.error("failed to send email: {}", response.getBody());
            }
        } catch (IOException ex) {
            logger.error("failed to send email: ", ex);
        }
    }
}
