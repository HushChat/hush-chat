package com.platform.software.config.interceptors;

import com.platform.software.common.constants.Constants;
import com.platform.software.common.service.ErrorResponseHandler;
import com.platform.software.common.utils.AuthUtils;
import com.platform.software.config.aws.AWSCognitoConfig;
import com.platform.software.exception.ErrorResponses;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JwtAuthorizationFilter extends OncePerRequestFilter {
    Logger log = LoggerFactory.getLogger(JwtAuthorizationFilter.class);

    private static final AntPathMatcher pathMatcher = new AntPathMatcher();
    private static final List<String> PUBLIC_PATTERNS = List.of(
        "/health-check/**", "/public/user/**", "/public/workspaces/**", "/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**",
        "/swagger-ui.html/**", "/swagger-resources/**", "/webjars/**", "/ws-message-subscription/**"
    );

    private final UserService userService;
    private final AWSCognitoConfig awsCognitoConfig;
    private final Map<String, RSAPublicKey> cachedPublicKeys = new ConcurrentHashMap<>();

    public JwtAuthorizationFilter(
        UserService userService,
        AWSCognitoConfig awsCognitoConfig
    ) {
        this.userService = userService;
        this.awsCognitoConfig = awsCognitoConfig;
    }

    private boolean isPublicEndpoint(HttpServletRequest request) {
        String path = request.getServletPath();
        return PUBLIC_PATTERNS.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    private void setCurrentWorkspace(HttpServletRequest request) {
        String tenantId = request.getHeader(Constants.X_TENANT_HEADER);
        if (tenantId != null) {
            WorkspaceContext.setCurrentWorkspace(tenantId);
        } else {
            log.warn("Missing tenant header");
        }
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
                setCurrentWorkspace(request);

                // Allow through for public routes
                if (isPublicEndpoint(request)) {
                    filterChain.doFilter(request, response); 
                    return;
                }

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

                    if (userType == null) {
                        ErrorResponseHandler.sendErrorResponse(response, HttpStatus.FORBIDDEN, ErrorResponses.USER_TYPE_IS_NULL_RESPONSE);
                        return;
                    }

                    handleTokenVerificationForUsers(
                        decodedJwt,
                        token
                    );

                    UserDetails userDetails;
                    try {
                        ChatUser user = userService.getUserByEmail(email);
                        userDetails = new UserDetails(user.getId(), email, UserTypeEnum.valueOf(userType), WorkspaceContext.getCurrentWorkspace());
                    } catch (Exception e) {
                        userDetails = new UserDetails();
                        userDetails.setEmail(email);
                        userDetails.setWorkspaceId(WorkspaceContext.getCurrentWorkspace());
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
