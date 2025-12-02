package com.platform.software.platform.workspaceuser.service;

import com.platform.software.chat.email.EmailContentType;
import com.platform.software.chat.email.EmailServiceFactory;
import com.platform.software.platform.workspace.entity.Workspace;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WorkspaceUserUtilService {

    @Value("${client.base.url}")
    private String frontendBaseUrl;

    private final EmailServiceFactory emailServiceFactory;

    public WorkspaceUserUtilService(EmailServiceFactory emailServiceFactory) {
        this.emailServiceFactory = emailServiceFactory;
    }

    public void sendInvitationEmail(Workspace workspace, String inviteeEmail, String inviterEmail) {

        String subject = "Invitation to join workspace: " + workspace.getName();
        String content = "You have been invited by " + inviterEmail + " to join the workspace: " + workspace.getName() +
                         ". Click the link below to accept the invitation:\n" + frontendBaseUrl + "/register";

        emailServiceFactory.sendEmail(inviteeEmail, subject, content, EmailContentType.TEXT_PLAIN.getType());
    }
}
