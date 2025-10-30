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

package com.platform.software.common.service.security;

import com.platform.software.common.constants.Constants;
import com.platform.software.common.model.UserTypeEnum;
import com.platform.software.config.aws.AWSCognitoConfig;
import com.platform.software.config.security.LoginResponseDTO;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomInternalServerErrorException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CognitoService {
    Logger logger = LoggerFactory.getLogger(CognitoService.class);

    @Value("${aws.cognito.region}")
    private String region;

    private final AWSCognitoConfig awsCognitoConfig;
    private final CognitoIdentityProviderClient cognitoClient;

    public CognitoService(
        AWSCognitoConfig awsCognitoConfig,
        CognitoIdentityProviderClient cognitoClient
    ) {
        this.awsCognitoConfig = awsCognitoConfig;
        this.cognitoClient = cognitoClient;
    }

    public SignUpResponse createUser(String email, String password, String tenant, UserTypeEnum userType) {
        String normalizedEmail = email.toLowerCase();
        SignUpRequest signUpRequest = SignUpRequest.builder()
                .clientId(awsCognitoConfig.getClientId())
                .username(normalizedEmail)
                .password(password)
                .userAttributes(
                        AttributeType.builder()
                                .name(Constants.EMAIL_ATTR)
                                .value(normalizedEmail)
                                .build(),
                        AttributeType.builder()
                                .name(Constants.PREFERRED_USERNAME_ATTR)
                                .value(normalizedEmail)
                                .build(),
                        AttributeType.builder()
                                .name(Constants.COGNITO_CUSTOM_TENANT_KEY)
                                .value(tenant)
                                .build(),
                        AttributeType.builder()
                                .name(Constants.COGNITO_CUSTOM_USER_TYPE_KEY)
                                .value(userType.getName())
                                .build())
                .build();

        try {
            return cognitoClient.signUp(signUpRequest);
        } catch (CognitoIdentityProviderException e) {
            String errorMessage = e.awsErrorDetails().errorMessage();
            throw new CustomBadRequestException(errorMessage);
        }
    }

    public LoginResponseDTO authenticateUser(String email, String password) {
        String normalizedEmail = email.toLowerCase();
        final String clientId = awsCognitoConfig.getClientId();
        final Map<String, String> authParams = new HashMap<>();
        authParams.put("USERNAME", normalizedEmail);
        authParams.put("PASSWORD", password);

        InitiateAuthRequest authRequest = InitiateAuthRequest.builder()
                .clientId(clientId)
                .authFlow(AuthFlowType.USER_PASSWORD_AUTH)
                .authParameters(authParams)
                .build();

        InitiateAuthResponse authResponse = cognitoClient.initiateAuth(authRequest);

        if (authResponse.challengeParameters().keySet().isEmpty()) {
            AuthenticationResultType authenticationResultType = authResponse.authenticationResult();
            LoginResponseDTO loginResponseDTO = LoginResponseDTO.builder()
                    .accessToken(authenticationResultType.accessToken())
                    .expiresIn(authenticationResultType.expiresIn())
                    .tokenType(authenticationResultType.tokenType())
                    .refreshToken(authenticationResultType.refreshToken())
                    .idToken(authenticationResultType.idToken())
                    .username(normalizedEmail)
                    .clientId(awsCognitoConfig.getClientId())
                    .region(region)
                    .userPoolId(awsCognitoConfig.getUserPoolId())
                    .build();
            return loginResponseDTO;
        } else {
            LoginResponseDTO loginResponseDTO = LoginResponseDTO.builder()
                    .challengeNameType(authResponse.challengeName())
                    .session(authResponse.session())
                    .build();
            return loginResponseDTO;
        }
    }

    private UserType fetchUserByEmail(String email) {
        ListUsersRequest listUsersRequest = ListUsersRequest.builder()
                .userPoolId(awsCognitoConfig.getUserPoolId())
                .filter("email = \"%s\"".formatted(email))
                .limit(1) // Assuming email is unique, so we expect at most one user.
                .build();

        ListUsersResponse response = cognitoClient.listUsers(listUsersRequest);

        List<UserType> users = response.users().stream()
                .filter(user -> user.attributes().stream()
                        .anyMatch(attr -> "email".equals(attr.name()) && email.equals(attr.value())))
                .collect(Collectors.toList());

        if (users.isEmpty()) {
            throw new CustomBadRequestException("User with the specified email not found.");
        }

        return users.get(0);
    }

    public void confirmSignUpOtp(String email, String confirmationCode) {
        String normalizedEmail = email.toLowerCase();

        ConfirmSignUpRequest confirmRequest = ConfirmSignUpRequest.builder()
                .clientId(awsCognitoConfig.getClientId())
                .username(normalizedEmail)
                .confirmationCode(confirmationCode)
                .build();

        try {
            cognitoClient.confirmSignUp(confirmRequest);
        } catch (Exception exception) {
            logger.error("failed to confirm sign up for email: {}", normalizedEmail, exception);
            throw new CustomBadRequestException("Failed to initiate confirmation code verification!");
        }
    }

    // Verifying through OTP marks the email as verified and sets the user status to
    // CONFIRMED.
    // This method manually performs both actions: confirming the user and verifying
    // the email.
    public void verifyClientAndEmail(String email) {
        String normalizedEmail = email.toLowerCase();

        try {
            AdminConfirmSignUpRequest adminConfirmRequest = AdminConfirmSignUpRequest.builder()
                    .userPoolId(awsCognitoConfig.getUserPoolId())
                    .username(normalizedEmail)
                    .build();

            AdminUpdateUserAttributesRequest updateUserRequest = AdminUpdateUserAttributesRequest.builder()
                    .userPoolId(awsCognitoConfig.getUserPoolId())
                    .username(normalizedEmail)
                    .userAttributes(AttributeType.builder()
                            .name("email_verified")
                            .value("true")
                            .build())
                    .build();

            cognitoClient.adminUpdateUserAttributes(updateUserRequest);
            cognitoClient.adminConfirmSignUp(adminConfirmRequest);
        } catch (Exception exception) {
            logger.error("failed to verify email for customer: {}", normalizedEmail, exception);
            throw new CustomBadRequestException("Failed to verify customer email!");
        }
    }

    public boolean signOut(String accessToken) {
        GlobalSignOutRequest signOutRequest = GlobalSignOutRequest.builder()
                .accessToken(accessToken)
                .build();

        try {
            cognitoClient.globalSignOut(signOutRequest);
            return true;
        } catch (NotAuthorizedException notAuthorizedException) {
            logger.error("failed to sign out user as the user has already signed out", notAuthorizedException);
        } catch (Exception exception) {
            logger.error("failed to sign out user", exception);
            throw new CustomInternalServerErrorException("Failed to sign out user!");
        }
        return false;
    }

    public boolean userExistsByEmail(String email) {
        try {
            fetchUserByEmail(email.toLowerCase());
            return true;
        } catch (CustomBadRequestException e) {
            return false;
        }
    }

    public void forgotPassword(String email) {
    String normalizedEmail = email.toLowerCase();

    boolean userExists = userExistsByEmail(normalizedEmail);

    if (!userExists) {
        throw new CustomBadRequestException("User with the specified email does not exist.");
    }

    ForgotPasswordRequest forgotPasswordRequest = ForgotPasswordRequest.builder()
            .clientId(awsCognitoConfig.getClientId())
            .username(normalizedEmail)
            .build();

    try {
        cognitoClient.forgotPassword(forgotPasswordRequest);
    } catch (LimitExceededException e) {
        logger.error("Rate exceeded for forgot password: {}", normalizedEmail, e);
        throw new CustomBadRequestException("You have exceeded the rate limit. Please try again later.");
    } catch (CognitoIdentityProviderException e) {
        String errorMessage = e.awsErrorDetails().errorMessage();
        logger.error("Cognito exception for {}: {}", normalizedEmail, errorMessage, e);
        throw new CustomBadRequestException("Unable to process forgot password request. Please try again later.");
    } catch (Exception e) {
        logger.error("Unexpected error during forgot password for: {}", normalizedEmail, e);
        throw new CustomBadRequestException("Something went wrong while initiating forgot password.");
    }
}


    public void confirmForgotPassword(PasswordResetDTO passwordResetDTO) {
        String normalizedEmail = passwordResetDTO.getEmail().toLowerCase();

        ConfirmForgotPasswordRequest request = ConfirmForgotPasswordRequest.builder()
                .clientId(awsCognitoConfig.getClientId())
                .username(normalizedEmail)
                .confirmationCode(passwordResetDTO.getCode())
                .password(passwordResetDTO.getPassword())
                .build();

        try {
            cognitoClient.confirmForgotPassword(request);
        } catch (CodeMismatchException e) {
            logger.error("invalid confirmation code for: {}", normalizedEmail, e);
            throw new CustomBadRequestException("The confirmation code is invalid or expired.");
        } catch (ExpiredCodeException e) {
            logger.error("expired confirmation code for: {}", normalizedEmail, e);
            throw new CustomBadRequestException("The confirmation code has expired. Please try again.");
        } catch (CognitoIdentityProviderException e) {
            String errorMessage = e.awsErrorDetails().errorMessage();
            logger.error("cognito error while confirming forgot password for {}: {}", normalizedEmail, errorMessage, e);
            throw new CustomBadRequestException("Unable to confirm password reset. Please try again or request a new reset code.");
        } catch (Exception e) {
            logger.error("unexpected error while confirming forgot password for: {}", normalizedEmail, e);
            throw new CustomBadRequestException("Something went wrong while confirming the password reset.");
        }
    }

    public LoginResponseDTO refreshTokens(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            logger.warn("refresh token is empty");
            throw new CustomBadRequestException("Refresh token cannot be null or empty!");
        }

        InitiateAuthRequest initiateAuthRequest = InitiateAuthRequest.builder()
                .authFlow(AuthFlowType.REFRESH_TOKEN_AUTH)
                .clientId(awsCognitoConfig.getClientId())
                .authParameters(Map.of("REFRESH_TOKEN", refreshToken))
                .build();

        InitiateAuthResponse authResponse = cognitoClient.initiateAuth(initiateAuthRequest);

        if(authResponse.challengeParameters().keySet().isEmpty()) {
            AuthenticationResultType authenticationResultType = authResponse.authenticationResult();

            LoginResponseDTO loginResponseDTO = LoginResponseDTO.builder()
                    .accessToken(authenticationResultType.accessToken())
                    .expiresIn(authenticationResultType.expiresIn())
                    .tokenType(authenticationResultType.tokenType())
                    .refreshToken(authenticationResultType.refreshToken())
                    .idToken(authenticationResultType.idToken())
                    .build();
            return loginResponseDTO;
        } else {
            LoginResponseDTO loginResponseDTO = LoginResponseDTO.builder()
                    .challengeNameType(authResponse.challengeName())
                    .session(authResponse.session())
                    .build();
            return loginResponseDTO;
        }
    }

    public void changePassword(String accessToken, String oldPassword, String newPassword) {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
            .accessToken(accessToken)
            .previousPassword(oldPassword)
            .proposedPassword(newPassword)
            .build();

        cognitoClient.changePassword(request);
    }

    public void resendSignUp(String email) {
        String normalizedEmail = email.toLowerCase();
        ResendConfirmationCodeRequest resendRequest = ResendConfirmationCodeRequest.builder()
                .clientId(awsCognitoConfig.getClientId())
                .username(normalizedEmail)
                .build();

        try {
            cognitoClient.resendConfirmationCode(resendRequest);
        } catch (Exception exception) {
            logger.error("failed to initiate confirmation code resending for email: {}", normalizedEmail, exception);
            throw new CustomBadRequestException("Failed to resend the confirmation code!");
        }
    }
}
