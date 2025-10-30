/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package com.platform.software.controller.external;

import com.platform.software.common.dto.LoginDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.platform.software.chat.user.dto.UserDTO;
import com.platform.software.chat.user.dto.UserUpsertDTO;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.common.service.security.CognitoService;
import com.platform.software.common.service.security.PasswordResetDTO;
import com.platform.software.config.security.LoginResponseDTO;

import io.swagger.annotations.ApiOperation;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/public/user")
public class PublicUserController {

    private final UserService userService;
    private final CognitoService cognitoService;

    public PublicUserController(
            UserService userService,
            CognitoService cognitoService
    ) {
        this.userService = userService;
        this.cognitoService = cognitoService;
    }

    @ApiOperation(value = "Create a new user", response = UserDTO.class)
    @PostMapping("auth/register")
    public ResponseEntity<UserDTO> createEmployee(
            @Valid @RequestBody UserUpsertDTO userUpsertDTO
    ) {
        ChatUser createdEmployee = userService.createUser(userUpsertDTO);
        UserDTO userDTO = new UserDTO(createdEmployee);
        return new ResponseEntity<>(userDTO, HttpStatus.CREATED);
    }

    @ApiOperation(value = "login an employee", response = LoginResponseDTO.class)
    @PostMapping("auth/login")
    public ResponseEntity<LoginResponseDTO> authenticateEmployee(
            @RequestBody LoginDTO loginDTO
    ) {
        LoginResponseDTO loginResponseDTO = userService.authenticateUser(loginDTO);
        return new ResponseEntity<>(loginResponseDTO, HttpStatus.OK);
    }

    @ApiOperation(value = "handle sign out", response = HttpStatus.class)
    @PostMapping("sign-out")
    public ResponseEntity<HttpStatus> signOut(
            @RequestParam String accessToken
    ) {
        userService.signOut(accessToken);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @ApiOperation(value = "handle confirm sign up", response = String.class)
    @PostMapping("/auth/confirm-signup")
    public ResponseEntity<String> confirmSignUp(
        @RequestParam String email,
        @RequestParam String confirmationCode
    ) {
        cognitoService.confirmSignUpOtp(email, confirmationCode);
        return ResponseEntity.ok("Confirm sign up request initiated");
    }

    @ApiOperation(value = "handle refresh token", response = LoginResponseDTO.class)
    @PostMapping("refresh-token")
    public ResponseEntity<LoginResponseDTO> refreshToken(@RequestBody RefreshToken refreshToken) {
        LoginResponseDTO authResponse = cognitoService.refreshTokens(refreshToken.getRefreshToken());
        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }

    @ApiOperation(value = "handle forget password", response = String.class)
    @PostMapping("auth/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        cognitoService.forgotPassword(email);
        return ResponseEntity.ok("Password reset request initiated");
    }

    @ApiOperation(value = "confirm forgot password", response = HttpStatus.class)
    @PostMapping("auth/confirm-forgot-password")
    public ResponseEntity<HttpStatus> confirmForgotPassword(@RequestBody PasswordResetDTO passwordResetDTO) {
        cognitoService.confirmForgotPassword(passwordResetDTO);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @ApiOperation(value = "handle resend signUp confirmation code", response = String.class)
    @PostMapping("auth/resend-signup")
    public ResponseEntity<String> resendSignUp(
            @RequestParam String email
    ) {
        cognitoService.resendSignUp(email);
        return ResponseEntity.ok("Resend signUp confirmation code request initiated");
    }

}
