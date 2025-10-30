package com.platform.software.common.utils;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.platform.software.common.constants.Constants;
import jakarta.servlet.http.HttpServletRequest;

import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.interfaces.RSAPublicKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class AuthUtils {

    public static Map<String, String> parseQueryParameters(String query) {
        Map<String, String> queryParams = new HashMap<>();
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int equalsIndex = pair.indexOf("=");
            if (equalsIndex > 0) {
                String key = URLDecoder.decode(pair.substring(0, equalsIndex), StandardCharsets.UTF_8);
                String value = URLDecoder.decode(pair.substring(equalsIndex + 1), StandardCharsets.UTF_8);
                queryParams.put(key, value);
            }
        }
        return queryParams;
    }

    public static String extractTokenFromHeader(HttpServletRequest request) {
        String bearerToken = request.getHeader(Constants.AUTHORIZATION_HEADER);
        if (bearerToken != null && bearerToken.startsWith(Constants.BEARER_PREFIX)) {
            return bearerToken.substring(Constants.BEARER_PREFIX.length());
        }
        return null;
    }

    public static void verifyToken(RSAPublicKey publicKey, String token) {
        Algorithm algorithm = Algorithm.RSA256(publicKey, null);
        JWTVerifier verifier = JWT.require(algorithm).acceptLeeway(30).build();
        verifier.verify(token);
    }

    public static RSAPublicKey getPublicKey(String keyId, String jwks, Map<String, RSAPublicKey> cachedPublicKeys) throws JwkException, MalformedURLException {
        RSAPublicKey publicKey = cachedPublicKeys.get(keyId);

        if (publicKey == null) {
            JwkProvider provider = new UrlJwkProvider(new URL(jwks));
            Jwk jwk = provider.get(keyId);
            publicKey = (RSAPublicKey) jwk.getPublicKey();
            cachedPublicKeys.put(keyId, publicKey);
        }

        return publicKey;
    }

    public static boolean checkIfTokenExpired(String token) {
        try {
            DecodedJWT jwt = JWT.decode(token);
            Date expirationDate = jwt.getExpiresAt();
            return expirationDate.before(new Date());
        } catch (JWTDecodeException exception) {
            // If there's an error decoding the token, consider it expired
            return true;
        }
    }
}
