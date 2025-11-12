package com.platform.software.config.workspace;

import org.hibernate.cfg.AvailableSettings;
import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.stereotype.Component;

import java.util.Map;


@Component
public class WorkspaceSchemaResolver implements CurrentTenantIdentifierResolver, HibernatePropertiesCustomizer {

    @Value("${spring.datasource.default.schema}")
    private String defaultSchema;


    @Override
    public String resolveCurrentTenantIdentifier() {
        String workspaceId = WorkspaceContext.getCurrentWorkspace();
        if (workspaceId != null) {
            return workspaceId;
        } else {
            return defaultSchema;
        }
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }

    @Override
    public void customize(Map<String, Object> hibernateProperties) {
        hibernateProperties.put(AvailableSettings.MULTI_TENANT_IDENTIFIER_RESOLVER, this);
    }
}
