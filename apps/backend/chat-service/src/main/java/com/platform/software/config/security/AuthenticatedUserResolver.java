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

package com.platform.software.config.security;

import com.platform.software.config.workspace.WorkspaceContext;
import org.springframework.core.MethodParameter;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.platform.software.config.security.model.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class AuthenticatedUserResolver implements HandlerMethodArgumentResolver {
    
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(AuthenticatedUser.class) 
            && parameter.getParameterType().equals(UserDetails.class);
    }
    
    @Override
    public Object resolveArgument(
        MethodParameter parameter, 
        ModelAndViewContainer mavContainer,
        NativeWebRequest webRequest, 
        WebDataBinderFactory binderFactory
    ) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User not authenticated");
        }
        
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails)) {
            throw new AccessDeniedException("Invalid user detailss");
        }
        
        UserDetails originalUser = (UserDetails) principal;
        UserDetails userDetails = new UserDetails();
        userDetails.setId(originalUser.getId());
        userDetails.setEmail(originalUser.getEmail());
        userDetails.setUserType(originalUser.getUserType());
        userDetails.setWorkspaceId(WorkspaceContext.getCurrentWorkspace());
        return userDetails;
    }
}