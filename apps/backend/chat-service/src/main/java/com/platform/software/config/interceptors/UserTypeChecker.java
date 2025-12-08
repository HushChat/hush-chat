package com.platform.software.config.interceptors;

import com.platform.software.config.security.model.UserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("userTypeChecker")
public class UserTypeChecker {

    public boolean hasUserType(String userType) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getCredentials() == null) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails)) {
            throw new AccessDeniedException("Invalid user details");
        }

        UserDetails originalUser = (UserDetails) principal;
        return originalUser.getWorkspaceUserRole().toString().equalsIgnoreCase(userType);
    }
}
