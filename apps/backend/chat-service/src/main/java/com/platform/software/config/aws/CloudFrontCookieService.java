package com.platform.software.config.aws;

import org.springframework.beans.factory.annotation.Value;
import software.amazon.awssdk.services.cloudfront.CloudFrontUtilities;
import software.amazon.awssdk.services.cloudfront.cookie.CookiesForCustomPolicy;
import software.amazon.awssdk.services.cloudfront.model.CustomSignerRequest;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
public class CloudFrontCookieService {

    @Value("${private.bucket.name}")
    private String privateBucketName;

    @Value("${cloud.front.url}")
    private String cloudFrontUrl;

    @Value("${cloudfront.cookie-domain}")
    private String cloudFrontCookieDomain;

    @Value("${cloudfront.key-pair-id}")
    private String cloudFrontKeyPairId;

    @Value("${cloudfront.private-key-file}")
    private String cloudFrontPrivateKeyPath;

    @Value("${cloudfront.expiration-time:60}")
    private int cookieExpirationMinutes;

    private static final Logger log = LoggerFactory.getLogger(CloudFrontCookieService.class);

    private final CloudFrontUtilities cloudFrontUtilities;
    private PrivateKey cachedPrivateKey;

    public CloudFrontCookieService() {
        this.cloudFrontUtilities = CloudFrontUtilities.create();
    }

    /**
     * Sets signed cookies granting access to ALL chat private resources. 
     */
    public void setChatResourcesCookies(HttpServletResponse response) {
        try {
            PrivateKey privateKey = getPrivateKey();
            Instant expirationTime = Instant.now()
                    .plus(cookieExpirationMinutes, ChronoUnit.MINUTES);

            String resourceUrl = cloudFrontUrl + privateBucketName;

            CustomSignerRequest request = CustomSignerRequest.builder()
                    .resourceUrl(resourceUrl)
                    .privateKey(privateKey)
                    .keyPairId(cloudFrontKeyPairId)
                    .expirationDate(expirationTime)
                    .build();

            CookiesForCustomPolicy cookies = cloudFrontUtilities
                    .getCookiesForCustomPolicy(request);

            addCookie(response, "CloudFront-Key-Pair-Id", cookies.keyPairIdHeaderValue());
            addCookie(response, "CloudFront-Signature", cookies.signatureHeaderValue());
            addCookie(response, "CloudFront-Policy", cookies.policyHeaderValue());

            log.debug("CloudFront signed cookies set for chat resources");

        } catch (Exception e) {
            log.error("Failed to set CloudFront cookies", e);
            throw new RuntimeException("Failed to set CloudFront cookies", e);
        }
    }

    /**
     * Clears CloudFront cookies
     */
    public void clearCookies(HttpServletResponse response) {
        clearCookie(response, "CloudFront-Key-Pair-Id");
        clearCookie(response, "CloudFront-Signature");
        clearCookie(response, "CloudFront-Policy");
    }

    private void addCookie(HttpServletResponse response, String name, String value) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setDomain(cloudFrontCookieDomain);
        cookie.setMaxAge(cookieExpirationMinutes * 60);
        response.addCookie(cookie);
    }

    private void clearCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, "");
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setDomain(cloudFrontCookieDomain);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private PrivateKey getPrivateKey() throws Exception {
        if (cachedPrivateKey == null) {
            cachedPrivateKey = loadPrivateKey();
        }
        return cachedPrivateKey;
    }

    private PrivateKey loadPrivateKey() throws Exception {
        String keyContent = Files.readString(Path.of(cloudFrontPrivateKeyPath));

        String privateKeyPEM = keyContent
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replace("-----BEGIN RSA PRIVATE KEY-----", "")
                .replace("-----END RSA PRIVATE KEY-----", "")
                .replaceAll("\\s", "");

        byte[] keyBytes = Base64.getDecoder().decode(privateKeyPEM);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");

        return keyFactory.generatePrivate(keySpec);
    }
}