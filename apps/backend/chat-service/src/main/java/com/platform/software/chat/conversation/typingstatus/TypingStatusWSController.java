package com.platform.software.chat.conversation.typingstatus;

import com.platform.software.chat.conversation.typingstatus.dto.UserTypingStatusUpsertDTO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class TypingStatusWSController {

    private final TypingStatusWSService typingStatusWSService;

    public TypingStatusWSController(TypingStatusWSService typingStatusWSService) {
        this.typingStatusWSService = typingStatusWSService;
    }

    @MessageMapping("/typing")
    public void handleTypingIndicator(UserTypingStatusUpsertDTO userTypingStatusUpsertDTO, Principal principal) {
        typingStatusWSService.invokeUserIsTyping(userTypingStatusUpsertDTO, principal.getName());
    }
}
