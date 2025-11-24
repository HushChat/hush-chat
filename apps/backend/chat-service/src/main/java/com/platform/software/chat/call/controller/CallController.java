package com.platform.software.chat.call.controller;

import com.platform.software.chat.call.dto.InitiateCallRequestDTO;
import com.platform.software.chat.call.dto.InitiateCallResponseDTO;
import com.platform.software.chat.call.service.CallService;
import com.platform.software.config.security.AuthenticatedUser;
import com.platform.software.config.security.model.UserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/conversations/{conversationId}/calls")
@RequiredArgsConstructor
public class CallController {


    private final CallService callService;

    @PostMapping("/initiate")
    public ResponseEntity<InitiateCallResponseDTO> initiateCall(
            @PathVariable Long conversationId,
            @AuthenticatedUser UserDetails userDetails,
            @RequestBody InitiateCallRequestDTO request
    ) {
        InitiateCallResponseDTO response = callService.initiateCall(
                conversationId,
                userDetails.getId(),
                request.isVideo()
        );

        return ResponseEntity.ok(response);
    }

}
