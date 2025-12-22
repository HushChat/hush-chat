package com.platform.software.chat.user.controller;

import com.platform.software.chat.user.dto.UserFilterCriteriaDTO;
import com.platform.software.chat.user.dto.UserResetPasswordDTO;

import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.platform.workspaceuser.service.WorkspaceUserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.platform.software.chat.call.dto.CallLogViewDTO;
import com.platform.software.chat.call.service.CallLogService;
import com.platform.software.chat.user.dto.UserDTO;
import com.platform.software.chat.user.dto.UserViewDTO;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.common.service.security.CognitoService;
import com.platform.software.config.aws.DocUploadRequestDTO;
import com.platform.software.config.aws.SignedURLDTO;
import com.platform.software.config.security.AuthenticatedUser;
import com.platform.software.config.security.model.UserDetails;
import io.swagger.annotations.ApiOperation;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final CallLogService callLogService;
    private final CognitoService cognitoService;
    private final WorkspaceUserService workspaceUserService;

    public UserController(
        UserService userService, 
        CallLogService callLogService,
        CognitoService cognitoService,
        WorkspaceUserService workspaceUserService
        ) {
        this.userService = userService;
        this.callLogService = callLogService;
        this.cognitoService = cognitoService;
        this.workspaceUserService = workspaceUserService;
    }

    /**
     * Get all users with pagination and optional filtering.
     *
     * @param pageable the pagination information
     * @param userFilterCriteriaDTO optional filter criteria for users
     * @return a paginated list of UserDTOs
     */
    @ApiOperation(value = "Get all users", response = UserDTO.class)
    @GetMapping
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            Pageable pageable,
            UserFilterCriteriaDTO userFilterCriteriaDTO,
            @AuthenticatedUser UserDetails authenticatedUser
    ) {
        Page<UserDTO> userDTOs = userService.getAllUsers(pageable, userFilterCriteriaDTO, authenticatedUser.getId());
        return ResponseEntity.ok(userDTOs);
    }

    /**
     * Get user by ID with profile image.
     *
     * @param id the ID of the user
     * @return UserDTO containing user details and profile image
     */
    @ApiOperation(value = "Get user by id", response = UserDTO.class)
    @GetMapping("{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable("id") Long id) {
        UserDTO userDTOs = userService.getUserByIdWithProfileImage(id);
        return ResponseEntity.ok(userDTOs);
    }

    /** get logged in user details
     *
     * @param authenticatedUser the authenticated user details
     * @return UserViewDTO containing logged in user details
     */
    @ApiOperation(value = "Get logged in user", response = UserViewDTO.class)
    @GetMapping("whoami")
    public ResponseEntity<UserViewDTO> getLoggedInUser(@AuthenticatedUser UserDetails authenticatedUser) {
        UserViewDTO user = userService.findUserById(authenticatedUser.getId(), authenticatedUser.getWorkspaceId());
        return ResponseEntity.ok(user);
    }

    /**
     * Create a new user.
     *
     * @param userDTO the user data transfer object containing user details
     * @return ResponseEntity containing the created UserViewDTO
     */
    @ApiOperation(value = "Update an user", response = UserViewDTO.class)
    @PutMapping
    public ResponseEntity<UserViewDTO> updateUser(@Valid @RequestBody UserDTO userDTO) {
        ChatUser updatedUser = userService.updateUser(userDTO);
        return ResponseEntity.ok(new UserViewDTO(updatedUser));
    }

    /**
     * Delete a user by ID.
     *
     * @param id the ID of the user to be deleted
     * @return ResponseEntity with HTTP status OK
     */
    @ApiOperation(value = "Get photo upload signed url", response = SignedURLDTO.class)
    @PostMapping("{id}/profile/upload-photo")
    public ResponseEntity<SignedURLDTO> generateSignedURLForProfilePictureUpload(
        @PathVariable Long id,
        @Valid @RequestBody DocUploadRequestDTO docUploadRequestDTO
    ) {
        SignedURLDTO imageSignedDTO = userService.generateSignedURLForProfilePictureUpload(docUploadRequestDTO, id);
        return ResponseEntity.ok(imageSignedDTO);
    }

    /**
     * Block a user by ID.
     *
     * @param blockedUserId the ID of the user to be blocked
     * @param authenticatedUser the authenticated user details
     * @return ResponseEntity with HTTP status OK
     */
    @ApiOperation(value = "Block a user")
    @PostMapping("{blockedUserId}/block")
    public ResponseEntity<Void> blockUser(
        @PathVariable Long blockedUserId,
        @AuthenticatedUser UserDetails authenticatedUser
    ) {
        userService.blockUser(authenticatedUser.getId(), blockedUserId);
        return ResponseEntity.ok().build();
    }

    /**
     * Unblock a user by ID.
     *
     * @param blockedUserId the ID of the user to be unblocked
     * @param authenticatedUser the authenticated user details
     * @return ResponseEntity with HTTP status NO_CONTENT
     */
    @ApiOperation(value = "Unblock a user")
    @DeleteMapping("{blockedUserId}/unblock")
    public ResponseEntity<Void> unblockUser(
        @PathVariable Long blockedUserId,
        @AuthenticatedUser UserDetails authenticatedUser
    ) {
        userService.unblockUser(authenticatedUser.getId(), blockedUserId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get blocked users for the logged-in user.
     *
     * @param authenticatedUser the authenticated user details
     * @param pageable the pagination information
     * @return a paginated list of UserViewDTOs representing blocked users
     */
    @ApiOperation(value = "Get blocked users for logged in user")
    @GetMapping("/blocked")
    public ResponseEntity<Page<UserViewDTO>> getBlockedUsers(
        @AuthenticatedUser UserDetails authenticatedUser,
        Pageable  pageable
    ) {
        Page<UserViewDTO> blockedUsers = userService.getBlockUsersByUserId(pageable, authenticatedUser.getId());
        return ResponseEntity.ok(blockedUsers);
    }

    /**
     * Get call logs where the user was a participant.
     *
     * @param authenticatedUser the authenticated user details
     * @param pageable pagination information
     * @return a paginated list of CallLogViewDTOs
     */
    @ApiOperation(value = "Get call logs where user was a participant", response = CallLogViewDTO.class)
    @GetMapping("/call-logs")
    public ResponseEntity<Page<CallLogViewDTO>> getCallLogs(
        @AuthenticatedUser UserDetails authenticatedUser,
        Pageable pageable
    ) {
        Page<CallLogViewDTO> callLogs = callLogService.getCallLogsByParticipantUserId(
            authenticatedUser.getId(), 
            pageable
        );
        return ResponseEntity.ok(callLogs);
    }

    @ApiOperation(value = "change password", response = HttpStatus.class)
    @PostMapping("change-password")
    public ResponseEntity<HttpStatus> changePassword(
        @RequestBody UserResetPasswordDTO userResetPasswordDTO
    ) {
        cognitoService.changePassword(
            userResetPasswordDTO.getAccessToken(),
            userResetPasswordDTO.getOldPassword(),
            userResetPasswordDTO.getNewPassword()
        );
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * Updates the role of a user within the current workspace.
     * <p>
     * This endpoint allows the authenticated user to change the role of another user
     * (identified by their email) in the currently active workspace context. The actual
     * role-switching logic is delegated to {@code workspaceUserService.toggleUserRole}.
     * </p>
     *
     * @param userDetails The details of the currently authenticated user, extracted from the authentication context.
     * @param email       The email address of the user whose role should be toggled within the workspace.
     * @return A {@link ResponseEntity} with HTTP status {@code 204 No Content} if the operation succeeds.
     *
     * @throws org.springframework.security.access.AccessDeniedException if the current user is not authorized to perform this operation.
     */
    @ApiOperation(value = "Update user role in workspace")
    @PatchMapping("{email}/role")
    public ResponseEntity<Void> toggleUserRole(@AuthenticatedUser UserDetails userDetails, @PathVariable String email) {
        workspaceUserService.toggleUserRole(userDetails, WorkspaceContext.getCurrentWorkspace(), email);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}