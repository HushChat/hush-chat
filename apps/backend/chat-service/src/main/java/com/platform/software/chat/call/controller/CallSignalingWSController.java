package com.platform.software.chat.call.controller;

import com.platform.software.chat.call.dto.*;
import com.platform.software.chat.call.service.CallSignalingService;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class CallSignalingWSController {

    private final CallSignalingService callSignalingService;

    public CallSignalingWSController(CallSignalingService callSignalingService) {
        this.callSignalingService = callSignalingService;
    }

    @MessageMapping("/call/initiate")
    public void initiateCall(
            CallInitiateDTO callInitiateDTO,
            @Header(SimpMessageHeaderAccessor.SESSION_ATTRIBUTES) Map<String, Object> sessionAttrs
    ) {
        callSignalingService.initiateCall(callInitiateDTO, sessionAttrs);
    }

    @MessageMapping("/call/answer")
    public void answerCall(
            CallAnswerDTO callAnswerDTO,
            @Header(SimpMessageHeaderAccessor.SESSION_ATTRIBUTES) Map<String, Object> sessionAttrs
    ) {
        callSignalingService.answerCall(callAnswerDTO, sessionAttrs);
    }

    @MessageMapping("/call/ice-candidate")
    public void forwardIceCandidate(
            CallIceCandidateDTO callIceCandidateDTO,
            @Header(SimpMessageHeaderAccessor.SESSION_ATTRIBUTES) Map<String, Object> sessionAttrs
    ) {
        callSignalingService.forwardIceCandidate(callIceCandidateDTO, sessionAttrs);
    }

    @MessageMapping("/call/end")
    public void endCall(
            CallEndDTO callEndDTO,
            @Header(SimpMessageHeaderAccessor.SESSION_ATTRIBUTES) Map<String, Object> sessionAttrs
    ) {
        callSignalingService.endCall(callEndDTO, sessionAttrs);
    }

    @MessageMapping("/call/reject")
    public void rejectCall(
            CallRejectDTO callRejectDTO,
            @Header(SimpMessageHeaderAccessor.SESSION_ATTRIBUTES) Map<String, Object> sessionAttrs
    ) {
        callSignalingService.rejectCall(callRejectDTO, sessionAttrs);
    }
}
