package com.platform.software.chat.conversation.controller;

import com.platform.software.chat.call.dto.CallLogUpsertDTO;
import com.platform.software.chat.call.service.CallLogService;
import com.platform.software.chat.conversation.dto.*;
import com.platform.software.chat.conversation.service.ConversationService;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantFilterCriteriaDTO;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantViewDTO;
import com.platform.software.chat.conversationparticipant.dto.JoinParticipantRequestDTO;
import com.platform.software.chat.message.dto.MessageSearchRequestDTO;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.message.service.MessageService;
import com.platform.software.config.aws.DocUploadRequestDTO;
import com.platform.software.config.aws.SignedURLDTO;
import com.platform.software.config.security.AuthenticatedUser;
import com.platform.software.config.security.model.UserDetails;
import com.platform.software.controller.external.OffsetBasedPageRequest;
import io.swagger.annotations.ApiOperation;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/conversations")
public class ConversationController {

    private final ConversationService conversationService;
    private final CallLogService callLogService;
    private final MessageService messageService;

    public ConversationController(
        ConversationService conversationService,
        MessageService messageService,
        CallLogService callLogService
    ) {
        this.conversationService = conversationService;
        this.callLogService = callLogService;
        this.messageService = messageService;
    }

    /**Create a new conversation, either one-to-one.
     *
     * @param conversationUpsertDTO the DTO containing conversation details
     * @param userDetails the authenticated user details
     * @return ResponseEntity with the created ConversationDTO
     */
    @ApiOperation(value = "create one to one conversation", response = ConversationDTO.class)
    @PostMapping("one-to-one")
    public ResponseEntity<ConversationDTO> createOneToOneConversation(
        @RequestBody ConversationUpsertDTO conversationUpsertDTO,
        @AuthenticatedUser UserDetails userDetails
    ) {
        ConversationDTO conversationDTO = conversationService.createOneToOneConversation(conversationUpsertDTO, userDetails.getId());
        return new ResponseEntity<>(conversationDTO, HttpStatus.OK);
    }

    /**Create a new group conversation.
     *
     * @param groupConversationUpsertDTO the DTO containing group conversation details
     * @param userDetails the authenticated user details
     * @return ResponseEntity with the created ConversationDTO
     */
    @ApiOperation(value = "create group conversation", response = ConversationDTO.class)
    @PostMapping("/group")
    public ResponseEntity<ConversationDTO> createGroupConversation(
        @Valid @RequestBody GroupConversationUpsertDTO groupConversationUpsertDTO,
        @AuthenticatedUser UserDetails userDetails
    ) {
        ConversationDTO conversationDTO = conversationService.createGroupConversation(
            groupConversationUpsertDTO,
            userDetails.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(conversationDTO);
    }

    /**Get all conversations for the authenticated user.
     *
     * @param userDetails the authenticated user details
     * @param offsetBasedPageRequest pagination information
     * @return ResponseEntity with a Page of ConversationDTOs
     */
    @ApiOperation(value = "get all conversations", response = ConversationDTO.class)
    @GetMapping
    public ResponseEntity<Page<ConversationDTO>> getAllConversations(
        @AuthenticatedUser UserDetails userDetails,
        OffsetBasedPageRequest offsetBasedPageRequest,
        ConversationFilterCriteriaDTO conversationFilterCriteria
    ) {
        Page<ConversationDTO> conversationDetails = conversationService.getAllConversations(
            userDetails.getId(), conversationFilterCriteria, offsetBasedPageRequest.getPageable()
        );
        return new ResponseEntity<>(conversationDetails, HttpStatus.OK);
    }

    /**Get conversation details by ID.
     *
     * @param conversationId the ID of the conversation
     * @param userDetails the authenticated user details
     * @return ResponseEntity with the ConversationDTO
     */
    @ApiOperation(value = "get conversation meta data", response = ConversationDTO.class)
    @GetMapping("{conversationId}")
    public ResponseEntity<ConversationDTO> getConversationDetails(
        @PathVariable Long conversationId,
        @AuthenticatedUser UserDetails userDetails
    ) {
        ConversationDTO conversationDetails = conversationService.getConversationDetails(conversationId, userDetails.getId());
        return new ResponseEntity<>(conversationDetails, HttpStatus.OK);
    }

    /** Get participants in a conversation.
     *
     * @param conversationId the ID of the conversation
     * @param userDetails the authenticated user details
     * @param pageable pagination information
     * @return ResponseEntity with a Page of ConversationParticipantViewDTOs
     */
    @ApiOperation(value = "get participants in a conversation", response = ConversationParticipantViewDTO.class)
    @GetMapping("{conversationId}/participants")
    public ResponseEntity<Page<ConversationParticipantViewDTO>> getConversationParticipants(
        @PathVariable Long conversationId,
        @AuthenticatedUser UserDetails userDetails,
        Pageable pageable,
        ConversationParticipantFilterCriteriaDTO filterCriteria
    ) {
        Page<ConversationParticipantViewDTO> participants = conversationService.getConversationParticipants(
            pageable,
            conversationId,
            userDetails.getId(),
            filterCriteria
        );
        return new ResponseEntity<>(participants, HttpStatus.OK);
    }

    /** Archive a conversation by ID.
     *
     * @param conversationId the ID of the conversation to archive
     * @param userDetails the authenticated user details
     * @return ResponseEntity with NO_CONTENT status
     */
    @ApiOperation(value = "Archive conversation")
    @PatchMapping("{conversationId}/archive")
    public ResponseEntity<Void> archiveConversation(
        @PathVariable Long conversationId,
        @AuthenticatedUser UserDetails userDetails
    ) {
        conversationService.archiveConversationById(conversationId, userDetails.getId());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    /** Delete a conversation by ID.
     *
     * @param id the ID of the conversation to delete
     * @param userDetails the authenticated user details
     * @return ResponseEntity with NO_CONTENT status
     */
    @ApiOperation(value = "Delete conversation")
    @DeleteMapping("{id}")
    public ResponseEntity<HttpStatus> deleteConversation(
        @PathVariable Long id,
        @AuthenticatedUser UserDetails userDetails
    ) {
        conversationService.deleteConversationById(id, userDetails.getId());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    /** Manage admin privileges in a conversation.
     *
     * @param conversationId the ID of the conversation
     * @param userDetails the authenticated user details
     * @param groupRoleManageRequest the DTO containing admin management details
     * @return ResponseEntity with OK status
     */
    @ApiOperation(value = "manage admin privileges of a conversation")
    @PatchMapping("{conversationId}/admins")
    public ResponseEntity<Void> manageAdminPrivileges(
        @PathVariable Long conversationId,
        @AuthenticatedUser UserDetails userDetails,
        @RequestBody GroupRoleManageRequestDTO groupRoleManageRequest
    ) {
        conversationService.manageAdminPrivileges(userDetails.getId(), conversationId, groupRoleManageRequest);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /** Leave a conversation.
     *
     * @param conversationId the ID of the conversation to leave
     * @param userDetails the authenticated user details
     * @return ResponseEntity with OK status
     */
    @ApiOperation(value = "leave from conversation")
    @PatchMapping("{conversationId}/leave")
    public ResponseEntity<Void> leaveFromConversation(
        @PathVariable Long conversationId,
        @AuthenticatedUser UserDetails userDetails
    ) {
        conversationService.leaveConversation(userDetails.getId(), conversationId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /** Join participants to a conversation.
     *
     * @param conversationId the ID of the conversation
     * @param userDetails the authenticated user details
     * @param joinParticipantRequest the DTO containing participant details
     * @return ResponseEntity with OK status
     */
    @ApiOperation(value = "join participants to the conversation")
    @PostMapping("{conversationId}/participants")
    public ResponseEntity<Void> addParticipantsToConversation(
        @PathVariable Long conversationId,
        @AuthenticatedUser UserDetails userDetails,
        @RequestBody JoinParticipantRequestDTO joinParticipantRequest
    ) {
        conversationService.addParticipantsToConversation(userDetails.getId(), conversationId, joinParticipantRequest);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * Toggle mute status of a conversation for the authenticated user.
     *
     * @param conversationId            the ID of the conversation
     * @param userDetails               the authenticated user details
     * @param MuteConversationDTO DTO containing the mutedUntil datetime; null
     *                                  to unmute
     * @return ResponseEntity with a boolean indicating if the mute status was
     *         updated
     */
    @ApiOperation(value = "toggle mute conversation")
    @PatchMapping("{conversationId}/mute")
    public ResponseEntity<Boolean> toggleMuteConversation(
            @PathVariable Long conversationId,
            @AuthenticatedUser UserDetails userDetails,
            @Valid @RequestBody MuteConversationDTO muteConversationDTO) {

        boolean result = conversationService.toggleMuteConversation(
                conversationId,
                userDetails.getId(),
                muteConversationDTO.getDuration());
        return ResponseEntity.ok(result);
    }


    /** Update group conversation info.
     *
     * @param conversationId the ID of the group conversation
     * @param groupConversationUpsertDTO the DTO containing updated group conversation details
     * @param userDetails the authenticated user details
     * @return ResponseEntity with the updated ConversationDTO
     */
    @ApiOperation(value = "update group conversation info", response = ConversationDTO.class)
    @PatchMapping("{conversationId}")
    public ResponseEntity<ConversationDTO> updateGroupConversationInfo(
        @PathVariable Long conversationId,
        @RequestBody GroupConversationUpsertDTO groupConversationUpsertDTO,
        @AuthenticatedUser UserDetails userDetails
    ) {
        ConversationDTO updatedConversation = conversationService.updateGroupInfo(
            userDetails.getId(),
            conversationId,
            groupConversationUpsertDTO
        );
        return ResponseEntity.ok(updatedConversation);
    }

    /** get signed URL for message upload.
     *
     * @param conversationId the ID of the conversation
     * @param docUploadRequestDTO the DTO containing upload request details
     * @param userDetails the authenticated user details
     * @return ResponseEntity with SignedURLDTO for message upload
     */
    @ApiOperation(value = "get signed URL for group icon upload", response = SignedURLDTO.class)
    @PostMapping("{conversationId}/upload-group-icon")
    public ResponseEntity<SignedURLDTO> generateSignedURLForGroupIconUpload(
        @PathVariable Long conversationId,
        @Valid @RequestBody DocUploadRequestDTO docUploadRequestDTO,
        @AuthenticatedUser UserDetails userDetails
    ) {
        SignedURLDTO imageSignedDTO = conversationService.generateSignedURLForGroupIconUpload(
            userDetails.getId(),
            conversationId, docUploadRequestDTO
        );
        return ResponseEntity.ok(imageSignedDTO);
    }


    /** get pinned message in a conversation.
     *
     * @param conversationId the ID of the conversation
     * @param userDetails the authenticated user details
     * @return ResponseEntity with the pinned MessageViewDTO
     */
    @ApiOperation(value = "get pinned message", response = MessageViewDTO.class)
    @GetMapping("{conversationId}/pinned")
    public ResponseEntity<MessageViewDTO> getPinnedMessage(
            @PathVariable Long conversationId,
            @AuthenticatedUser UserDetails userDetails
    ) {
        MessageViewDTO pinnedMessage = conversationService.getPinnedMessage(
                userDetails.getId(),
                conversationId
        );
        return ResponseEntity.ok(pinnedMessage);
    }


    /** save call logs for a conversation.
     *
     * @param conversationId the ID of the conversation
     * @param callLogUpsertDTO the DTO containing call log details
     * @param userDetails the authenticated user details
     * @return ResponseEntity with OK status
     */
    @ApiOperation(value = "save call logs")
    @PostMapping("{conversationId}/calls")
    public ResponseEntity<Void> createCallLog(
        @PathVariable Long conversationId,
        @Valid @RequestBody CallLogUpsertDTO callLogUpsertDTO,
        @AuthenticatedUser UserDetails userDetails
    ) {
        callLogService.saveCallLogInfo(conversationId, callLogUpsertDTO, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    /** toggle favorite status of a conversation.
     *
     * @param conversationId the ID of the conversation
     * @param userDetails the authenticated user details
     * @return ResponseEntity with OK status
     */
    @ApiOperation(value = "toggle favorite status of conversation")
    @PatchMapping("{conversationId}/favorite")
    public ResponseEntity<Boolean> toggleFavoriteConversation(
        @PathVariable Long conversationId,
        @AuthenticatedUser UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                conversationService.toggleFavoriteConversation(conversationId, userDetails.getId())
        );
    }

    /** Get all favorite conversations for the authenticated user.
     *
     * @param userDetails the authenticated user details
     * @param pageable pagination information
     * @return ResponseEntity with a Page of ConversationDTOs
     */
    @ApiOperation(value = "get all favorite conversations", response = ConversationDTO.class)
    @GetMapping("favorite-conversations")
    public ResponseEntity<Page<ConversationDTO>> getFavoriteConversations(
        @AuthenticatedUser UserDetails userDetails,
        Pageable pageable
    ) {
        Page<ConversationDTO> favoriteConversations = conversationService.getFavoriteConversations(userDetails.getId(), pageable);
        return ResponseEntity.ok(favoriteConversations);
    }

    /**
     * Get chat summary statistics for the authenticated user.
     *
     * @param userDetails the authenticated user details
     * @return ResponseEntity with ChatSummaryDTO containing conversation statistics
     */
    @ApiOperation(value = "get chat summary statistics", response = ChatSummaryDTO.class)
    @GetMapping("chat-summary")
    public ResponseEntity<ChatSummaryDTO> getChatSummary(
            @AuthenticatedUser UserDetails userDetails
    ) {
        ChatSummaryDTO chatSummary = conversationService.getChatSummary(userDetails.getId());
        return ResponseEntity.ok(chatSummary);
    }

    /** get other user's details in a one-to-one conversation.
     *
     * @param conversationId the ID of the conversation
     * @param userDetails the authenticated user details
     * @return ResponseEntity with ConversationOneToOneProfileDTO of the other user
     */
    @ApiOperation(value = "get other user's details in a one-to-one conversation", response = ConversationOneToOneProfileDTO.class)
    @GetMapping("{conversationId}/profile")
    public ResponseEntity<ConversationOneToOneProfileDTO> getOtherUserProfile(
            @PathVariable Long conversationId,
            @AuthenticatedUser UserDetails userDetails
    ) {
        ConversationOneToOneProfileDTO otherUser = conversationService.getOtherUserProfileInOneToOneConversation(
                conversationId,
                userDetails.getId()
        );
        return ResponseEntity.ok(otherUser);
    }

    @ApiOperation(value = "toggle pin conversation")
    @PostMapping("{conversationId}/pin")
    public ResponseEntity<Boolean> togglePinConversation(
        @PathVariable Long conversationId,
        @AuthenticatedUser UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                conversationService.togglePinConversation(conversationId, userDetails.getId())
        );
    }

    @ApiOperation(value = "get pinned conversations")
    @GetMapping("pinned-conversations")
    public ResponseEntity<Page<ConversationDTO>> getPinnedConversations(
        @AuthenticatedUser UserDetails authenticatedUser,
        Pageable pageable
    ) {
        Page<ConversationDTO> pinnedConversations = conversationService.getPinnedConversations(authenticatedUser.getId(), pageable);
        return ResponseEntity.ok(pinnedConversations);
    }

    /** get profile of a group conversation.
     *
     * @param conversationId the ID of the conversation
     * @param userDetails the authenticated user details
     * @return ResponseEntity with ConversationGroupProfileDTO
     */
    @ApiOperation(value = "get conversation group profile", response = ConversationGroupProfileDTO.class)
    @GetMapping("{conversationId}/group-profile")
    public ResponseEntity<ConversationGroupProfileDTO> getConversationGroupProfile(
            @PathVariable Long conversationId,
            @AuthenticatedUser UserDetails userDetails
    ) {
        ConversationGroupProfileDTO groupProfile = conversationService.getConversationGroupProfile(
                conversationId,
                userDetails.getId()
        );
        return ResponseEntity.ok(groupProfile);
    }

    /**
     * Search message from conversation response entity.
     *
     * @param conversationId          the conversation id
     * @param userDetails             the user details
     * @param messageSearchRequestDTO the message search request dto
     * @return the response entity
     */
    @ApiOperation(value = "search message from a conversation", response = MessageViewDTO.class)
    @PostMapping("{conversationId}/messages/search")
    public ResponseEntity<List<MessageViewDTO>> searchMessageFromConversation(
        @PathVariable Long conversationId,
        @AuthenticatedUser UserDetails userDetails,
        @RequestBody MessageSearchRequestDTO messageSearchRequestDTO
    ) {
        List<MessageViewDTO> messages = messageService.searchMessagesFromConversation(
            conversationId, userDetails.getId(), messageSearchRequestDTO
        );
        return new ResponseEntity<>(messages, HttpStatus.OK);
    }

    /** Delete a participant from a conversation.
     *
     * @param conversationId the ID of the conversation
     * @param userDetails the authenticated user details
     * @return ResponseEntity with NO_CONTENT status
     */
    @ApiOperation(value = "delete conversation participant")
    @DeleteMapping("{conversationId}/participant")
    public ResponseEntity<Void> deleteConversationForCurrentUser(
        @PathVariable Long conversationId,
        @AuthenticatedUser UserDetails userDetails
    ) {
        conversationService.deleteConversationForCurrentUser(userDetails.getId(), conversationId);
        return ResponseEntity.noContent().build();
    }
  
    /** Get meta data of a conversation.
     *
     * @param conversationId the ID of the conversation
     * @param userDetails the authenticated user details
     * @return ResponseEntity with ConversationMetaDataDTO
     */
    @ApiOperation(value = "get conversation meta data", response = ConversationDTO.class)
    @GetMapping("{conversationId}/meta")
    public ResponseEntity<ConversationMetaDataDTO> getConversationMetaData(
            @PathVariable Long conversationId,
            @AuthenticatedUser UserDetails userDetails
    ) {
        ConversationMetaDataDTO conversationDetails = conversationService.getConversationMetaData(
                conversationId,
                userDetails.getId()
        );
        return ResponseEntity.ok(conversationDetails);
    }

    /**
     * Search conversations response entity.
     *
     * @param authenticatedUser       the authenticated user
     * @param pageable                the pageable
     * @param messageSearchRequestDTO the message search request dto
     * @return the response entity
     */
    @ApiOperation(value = "search from conversations", response = ConversationDTO.class)
    @PostMapping("search")
    public ResponseEntity<Page<ConversationDTO>> searchConversations(
        @AuthenticatedUser UserDetails authenticatedUser,
        Pageable pageable,
        @RequestBody MessageSearchRequestDTO messageSearchRequestDTO
    ) {
        Page<ConversationDTO> searchConversations = conversationService
            .searchConversations(authenticatedUser.getId(), messageSearchRequestDTO, pageable);
        return ResponseEntity.ok(searchConversations);
    }

    @ApiOperation(value = "remove participant from conversation")
    @DeleteMapping("{conversationId}/participants/{participantId}")
    public ResponseEntity<Void> removeFromConversation(
            @PathVariable Long conversationId,
            @PathVariable Long participantId,
            @AuthenticatedUser UserDetails userDetails
    ) {
        conversationService.removeParticipantFromConversation(userDetails.getId(), conversationId, participantId);
        return ResponseEntity.noContent().build();
    }

    @ApiOperation(value = "report conversation")
    @PostMapping("{conversationId}/report")
    public ResponseEntity<Void> reportConversation(
            @PathVariable Long conversationId,
            @RequestBody ConversationReportRequestDTO request,
            @AuthenticatedUser UserDetails userDetails) {
        conversationService.reportConversation(userDetails.getId(), conversationId, request.getReason());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @ApiOperation(value = "Update message sending restrictions for group", response = ConversationDTO.class)
    @PatchMapping("{conversationId}/message-restrictions")
    public ResponseEntity<ConversationDTO> updateMessageRestrictions(
            @PathVariable Long conversationId,
            @Valid @RequestBody ConversationPermissionsUpdateDTO conversationPermissionUpdateDTO,
            @AuthenticatedUser UserDetails userDetails
    ) {
        ConversationDTO updated = conversationService.updateOnlyAdminsCanSendMessages(
                userDetails.getId(),
                conversationId,
                conversationPermissionUpdateDTO
        );
        return ResponseEntity.ok(updated);
    }

    @ApiOperation(value = "Get conversation invite Link", response = InviteLinkDTO.class)
    @GetMapping("{conversationId}/invite-link")
    public ResponseEntity<InviteLinkDTO> getActiveInviteLink(
            @PathVariable Long conversationId,
            @AuthenticatedUser UserDetails userDetails
    ) {
        return ResponseEntity.ok(conversationService.getCurrentInviteLink(userDetails.getId(), conversationId));
    }
  
    @ApiOperation(value = "Create conversation invite Link", response = InviteLinkDTO.class)
    @PostMapping("{conversationId}/invite-link")
    public ResponseEntity<InviteLinkDTO> createNewInviteLink(
            @PathVariable Long conversationId,
            @AuthenticatedUser UserDetails userDetails
    ) {
        return ResponseEntity.ok(conversationService.createNewInviteLink(userDetails.getId(), conversationId));
    }

    @ApiOperation(value = "Join conversation using invite token", response = ConversationDTO.class)
    @PostMapping("invite-link/{token}/join")
    public ResponseEntity<ConversationDTO> joinConversationByInviteLink(
            @PathVariable String token,
            @AuthenticatedUser UserDetails userDetails
    ){
        return ResponseEntity.ok(conversationService.joinConversationByInviteLink(userDetails.getId(), token));
    }

    @PatchMapping("{conversationId}/notifications/mentions-only")
    public ResponseEntity<Boolean> toggleNotifyOnlyOnMentions(
        @AuthenticatedUser UserDetails userDetails,
        @PathVariable Long conversationId
    ) {
        return ResponseEntity.ok(conversationService.toggleNotifyMentionsOnly(conversationId, userDetails.getId()));
    }

    @PatchMapping("{conversationId}/group-message-pin-permission")
    public ResponseEntity<Boolean> updateGroupPinnedMessagePermission(
            @AuthenticatedUser UserDetails userDetails,
            @PathVariable Long conversationId,
            @Valid @RequestBody Boolean onlyAdminsCanPinMessages
    ) {
        return ResponseEntity.ok(conversationService.updateGroupPinnedMessagePermission(userDetails.getId(), conversationId, onlyAdminsCanPinMessages));
    }

}
