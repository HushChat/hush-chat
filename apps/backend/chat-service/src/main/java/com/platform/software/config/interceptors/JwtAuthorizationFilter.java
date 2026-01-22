package com.platform.software.config.interceptors;

import com.platform.software.common.constants.Constants;
import com.platform.software.common.service.ErrorResponseHandler;
import com.platform.software.common.service.security.CustomHttpStatus;
import com.platform.software.common.utils.AuthUtils;
import com.platform.software.config.aws.AWSCognitoConfig;
import com.platform.software.exception.CustomWorkspaceMissingException;
import com.platform.software.exception.ErrorResponses;
import com.platform.software.platform.workspace.service.WorkspaceService;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import com.platform.software.platform.workspaceuser.service.WorkspaceUserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import com.auth0.jwk.JwkException;
import com.auth0.jwt.JWT;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.common.model.UserTypeEnum;
import com.platform.software.config.security.model.UserDetails;
import com.platform.software.config.workspace.WorkspaceContext;

import java.io.IOException;
import java.net.MalformedURLException;
import java.security.interfaces.RSAPublicKey;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JwtAuthorizationFilter extends OncePerRequestFilter {
    Logger log = LoggerFactory.getLogger(JwtAuthorizationFilter.class);

    private static final AntPathMatcher pathMatcher = new AntPathMatcher();
    private static final List<String> PUBLIC_PATTERNS = List.of(
        "/health-check/**", "/public/user/**", "/protected/**", "/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**",
        "/swagger-ui.html/**", "/swagger-resources/**", "/webjars/**", "/ws-message-subscription/**"
    );

    private static final List<String> PLATFORM_PATTERNS = List.of(
            "/workspaces", "/workspaces/my-workspaces"
    );

    private final UserService userService;
    private final AWSCognitoConfig awsCognitoConfig;
    private final WorkspaceUserService workspaceUserService;
    private final Environment environment;
    private final WorkspaceService workspaceService;

    private final Map<String, RSAPublicKey> cachedPublicKeys = new ConcurrentHashMap<>();

    public JwtAuthorizationFilter(
            UserService userService,
            AWSCognitoConfig awsCognitoConfig,
            WorkspaceUserService workspaceUserService,
            Environment environment,
            WorkspaceService workspaceService
    ) {
        this.userService = userService;
        this.awsCognitoConfig = awsCognitoConfig;
        this.workspaceUserService = workspaceUserService;
        this.environment = environment;
        this.workspaceService = workspaceService;
    }

    private boolean isPublicEndpoint(HttpServletRequest request) {
        String path = request.getServletPath();
        return PUBLIC_PATTERNS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    private boolean isPlatformOnlyEndpoint(HttpServletRequest request) {
        String path = request.getServletPath();
        return PLATFORM_PATTERNS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    private WorkspaceUser setCurrentWorkspace(HttpServletRequest request, String email) {
        String tenantId = request.getHeader(Constants.X_TENANT_HEADER);

        // Validate header
        if (tenantId == null) {
            log.warn("Workspace validation failed: missing header. email={}", email);
            throw new CustomWorkspaceMissingException("Workspace header is missing or invalid.");
        }

        WorkspaceUser workspaceUser = workspaceUserService.validateWorkspaceAccess(tenantId, email);

        if (workspaceUser == null) {
            log.warn("Unauthorized workspace access. tenantId={}, email={}", tenantId, email);
            throw new CustomWorkspaceMissingException("You don't have access to this workspace.");
        }

        WorkspaceContext.setCurrentWorkspace(tenantId);
        return workspaceUser;
    }

    private boolean isProfileActive(String... profiles) {
        Set<String> activeProfiles = new HashSet<>(Arrays.asList(environment.getActiveProfiles()));
        return Arrays.stream(profiles).anyMatch(activeProfiles::contains);
    }

    private String getUserForwardedIp(HttpServletRequest request) {
        String clientIp = request.getHeader(Constants.X_FORWARDED_FOR_HEADER);
        if (clientIp == null) {
            clientIp = request.getRemoteAddr();
        }
        return clientIp;
    }

    private boolean isAuthorized(String ipAddress, String tenantId) {
        Set<String> allowedIps = workspaceService.getAllowedIps(tenantId);
        if (allowedIps.isEmpty()) {
            return true;
        }
        return allowedIps.contains(ipAddress);
    }

    private boolean validateUserIp(HttpServletRequest request, ChatUser user, String workspaceId) {
        if(isProfileActive(Constants.LOCAL_PROFILE_NAME) || user == null || user.getIsRemoteAccessEnabled()){
            return true;
        }

        String forwardedIp = getUserForwardedIp(request);

        boolean isAuthorizedIpFound = false;

        if (forwardedIp != null && !forwardedIp.trim().isEmpty()) {
            String[] ips = forwardedIp.split(",");
            for (String ip : ips) {
                String trimmedIp = ip.trim();
                if (isAuthorized(trimmedIp, workspaceId)) {
                    isAuthorizedIpFound = true;
                    break;
                }
            }
        }
        return isAuthorizedIpFound;
    }


    private void handleTokenVerificationForUsers(
        DecodedJWT decodedJwt,
        String token
    ) throws JwkException, MalformedURLException {
        RSAPublicKey publicKey = AuthUtils.getPublicKey(decodedJwt.getKeyId(), awsCognitoConfig.getJwks(), cachedPublicKeys);
        AuthUtils.verifyToken(publicKey, token);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        WorkspaceUser workspaceUser = null;

        // Allow through for public routes
        if (isPublicEndpoint(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract Token
        String token = AuthUtils.extractTokenFromHeader(request);
        if (token == null) {
            ErrorResponseHandler.sendErrorResponse(response, HttpStatus.UNAUTHORIZED, ErrorResponses.JWT_TOKEN_MISSING_RESPONSE);
            return;
        }

        try {
            DecodedJWT decodedJwt = JWT.decode(token);
            Map<String, Claim> claims = decodedJwt.getClaims();
            String email = claims.get(Constants.EMAIL_ATTR).asString().replace("\"", "");
            String userType = claims.get(Constants.COGNITO_CUSTOM_USER_TYPE_KEY).asString();

            //skip setting workspace for platform only endpoints
            if(!isPlatformOnlyEndpoint(request)){
                try {
                    workspaceUser = setCurrentWorkspace(request, email);
                } catch (CustomWorkspaceMissingException e){
                    ErrorResponseHandler.sendErrorResponse(response, CustomHttpStatus.WORKSPACE_ID_MISSING, ErrorResponses.WORKSPACE_ID_MISSING_RESPONSE);
                    return;
                }
            }

            if (userType == null) {
                ErrorResponseHandler.sendErrorResponse(response, HttpStatus.FORBIDDEN, ErrorResponses.USER_TYPE_IS_NULL_RESPONSE);
                return;
            }

            handleTokenVerificationForUsers(
                decodedJwt,
                token
            );

            UserDetails userDetails;
            ChatUser user = null;
            try {
                user = userService.getUserByEmail(email);
                userDetails = new UserDetails(
                    user.getId(), email, UserTypeEnum.valueOf(userType), WorkspaceContext.getCurrentWorkspace(),
                    workspaceUser != null ? workspaceUser.getRole() : null
                );
            } catch (Exception e) {
                userDetails = new UserDetails();
                userDetails.setEmail(email);
            }

            // Validate IP Address
            if( !isPlatformOnlyEndpoint(request) && !validateUserIp(request, user, WorkspaceContext.getCurrentWorkspace())) {
                log.warn("Unauthorized IP access attempt. email={}, workspaceId={}", email, WorkspaceContext.getCurrentWorkspace());
                ErrorResponseHandler.sendErrorResponse(response, HttpStatus.FORBIDDEN, ErrorResponses.IP_NOT_AUTHORIZED_RESPONSE);
                return;
            }

            //handle permissions later
            Set<GrantedAuthority> authorities = new HashSet<>();

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, userType, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            filterChain.doFilter(request, response);
        } catch (JWTVerificationException | JwkException e) {
            ErrorResponseHandler.sendErrorResponse(response, HttpStatus.UNAUTHORIZED, ErrorResponses.INVALID_TOKEN_PROVIDED_RESPONSE);
        }
    }

}
