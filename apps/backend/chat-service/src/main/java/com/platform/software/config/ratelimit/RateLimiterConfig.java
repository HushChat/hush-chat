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

package com.platform.software.config.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.software.common.constants.Constants;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
@Profile({Constants.MAIN_SERVICE_PRODUCTION_PROFILE_NAME, Constants.MAIN_SERVICE_STAGING_PROFILE_NAME, Constants.MAIN_SERVICE_PENTEST_PROFILE_NAME})
public class RateLimiterConfig implements WebMvcConfigurer {
    private final ObjectMapper objectMapper;

    public RateLimiterConfig(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new RateLimiterInterceptor(objectMapper));
    }

    private static class RateLimiterInterceptor implements HandlerInterceptor {
        private static final Logger logger = LoggerFactory.getLogger(RateLimiterInterceptor.class);
        private final Map<String, UserRateLimit> rateLimitMap = new ConcurrentHashMap<>();
        private final ObjectMapper objectMapper;

        public RateLimiterInterceptor(ObjectMapper objectMapper) {
            this.objectMapper = objectMapper;
        }

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
            String requestURI = request.getRequestURI();

            if (RateLimiterUtils.isPublicRoute(requestURI)) {
                return true;
            }

            String username = "anonymous";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                username = auth.getName();
            }
           
            UserRateLimit rateLimit = rateLimitMap.computeIfAbsent(username, k -> new UserRateLimit());

            if (!rateLimit.tryAcquire()) {
                handleRateLimitExceeded(response, username, rateLimit);
                return false;
            }

            return true;
        }

        private void handleRateLimitExceeded(HttpServletResponse response, String username, UserRateLimit rateLimit) throws Exception {
            if (rateLimit.shouldLogViolation()) {
                RateLimitStats stats = rateLimit.getStats();
                logger.warn("Rate limit exceeded for user: {}. Stats: requests={}, timeFrame={}s, requestRate={}/s, firstViolationAt={}", 
                    username,
                    stats.getTotalRequests(),
                    stats.getTimeFrameSeconds(),
                    stats.getRequestsPerSecond(),
                    stats.getFirstViolationTime()
                );
            }

            sendRateLimitExceededResponse(response);
        }

        private void sendRateLimitExceededResponse(HttpServletResponse response) throws Exception {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            Map<String, String> errorResponse = Map.of(
                "error", "RATE_LIMIT_ERROR: Too Many Requests",
                "message", "RATE_LIMIT_ERROR: You have reached the maximum number of requests. Please wait a moment before trying again."
            );

            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        }
    }

    private static class UserRateLimit {
        private final int maxRequests = 400;
        private final long timeFrameMillis = 60000; // 1 minute
        private long lastResetTime = System.currentTimeMillis();
        private int requestCount = 0;
        private Long firstViolationInWindow = null;
        private boolean violationLogged = false;

        public synchronized boolean tryAcquire() {
            long currentTime = System.currentTimeMillis();
            if (currentTime - lastResetTime > timeFrameMillis) {
                reset(currentTime);
            }

            if (requestCount < maxRequests) {
                requestCount++;
                return true;
            }

            if (firstViolationInWindow == null) {
                firstViolationInWindow = currentTime;
            }
            
            return false;
        }

        private void reset(long currentTime) {
            lastResetTime = currentTime;
            requestCount = 0;
            firstViolationInWindow = null;
            violationLogged = false;
        }

        public synchronized boolean shouldLogViolation() {
            if (!violationLogged) {
                violationLogged = true;
                return true;
            }
            return false;
        }

        public RateLimitStats getStats() {
            long currentTime = System.currentTimeMillis();
            double timeFrameSeconds = (currentTime - lastResetTime) / 1000.0;
            double requestsPerSecond = requestCount / timeFrameSeconds;

            return new RateLimitStats(
                requestCount,
                timeFrameSeconds,
                requestsPerSecond,
                firstViolationInWindow != null ? Instant.ofEpochMilli(firstViolationInWindow) : null
            );
        }
    }

    private static class RateLimitStats {
        private final int totalRequests;
        private final double timeFrameSeconds;
        private final double requestsPerSecond;
        private final Instant firstViolationTime;

        public RateLimitStats(int totalRequests, double timeFrameSeconds, double requestsPerSecond, Instant firstViolationTime) {
            this.totalRequests = totalRequests;
            this.timeFrameSeconds = timeFrameSeconds;
            this.requestsPerSecond = requestsPerSecond;
            this.firstViolationTime = firstViolationTime;
        }

        public int getTotalRequests() {
            return totalRequests;
        }

        public double getTimeFrameSeconds() {
            return timeFrameSeconds;
        }

        public double getRequestsPerSecond() {
            return requestsPerSecond;
        }

        public Instant getFirstViolationTime() {
            return firstViolationTime;
        }
    }
}
