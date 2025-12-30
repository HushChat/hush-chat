package com.platform.software.chat.conversation.typingstatus;

import com.platform.software.chat.conversation.typingstatus.dto.UserTypingStatusDTO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class TypingStatusWSController {

    private final TypingStatusWSService typingStatusWSService;

    public TypingStatusWSController(TypingStatusWSService typingStatusWSService) {
        this.typingStatusWSService = typingStatusWSService;
    }

    @MessageMapping("/typing")
    public void handleTypingIndicator(UserTypingStatusDTO userTypingStatusDTO) {
        typingStatusWSService.invokeUserIsTyping(userTypingStatusDTO);
    }
}
