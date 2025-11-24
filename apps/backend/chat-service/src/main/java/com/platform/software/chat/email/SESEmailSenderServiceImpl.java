package com.platform.software.chat.email;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailService;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClientBuilder;
import com.amazonaws.services.simpleemail.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SESEmailSenderServiceImpl implements EmailSenderService {

    Logger logger = LoggerFactory.getLogger(SESEmailSenderServiceImpl.class);
    private static final String CHARSET = "UTF-8";

    @Value("${cloud.aws.credentials.accessKey}")
    private String awsAccessKey;

    @Value("${cloud.aws.credentials.secretKey}")
    private String awsSecretKey;

    //@Value("${aws.cognito.region}")
    private String awsRegion;


    @Override
    public void sendEmail(String to, String senderEmail, String subject, String content, String contentType) {
        BasicAWSCredentials awsCredentials = new BasicAWSCredentials(awsAccessKey, awsSecretKey);

        AmazonSimpleEmailService sesClient = AmazonSimpleEmailServiceClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
                .withRegion(awsRegion)
                .build();

        Body body;
        if ("text/html".equals(contentType)) {
            body = new Body().withHtml(new Content().withCharset(CHARSET).withData(content));
        } else if ("text/plain".equals(contentType)) {
            body = new Body().withText(new Content().withCharset(CHARSET).withData(content));
        } else {
            logger.error("unsupported content type: {}", contentType);
            return;
        }

        try {
            SendEmailRequest request = new SendEmailRequest()
                    .withDestination(new Destination().withToAddresses(to))
                    .withMessage(new Message()
                            .withBody(body)
                            .withSubject(new Content().withCharset(CHARSET).withData(subject)))
                    .withSource(senderEmail);
            sesClient.sendEmail(request);
            logger.info("email sent to {} with subject {}", to, subject);
        } catch (Exception exception) {
            logger.error("failed to send email to {} with subject {}", to, subject, exception);
        }
    }
}
