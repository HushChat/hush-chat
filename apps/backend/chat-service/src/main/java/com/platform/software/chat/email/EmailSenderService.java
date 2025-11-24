package com.platform.software.chat.email;

public interface EmailSenderService {
    void sendEmail(String to, String senderEmail, String subject, String content, String contentType);
}
