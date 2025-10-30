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

package com.platform.software.config.workspace;

import com.platform.software.common.utils.SharedCommonUtils;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.Constructor;
import java.io.IOException;
import java.io.StringReader;
import java.util.*;

/**
 * Loads workspace configuration from a YAML file.
 *
 * @deprecated This is only used in the local development environment
 *             for seeding data or other local setup tasks. It should not be used
 *             in production or for runtime workspace resolution.
 */
@Component
public class WorkspaceConfig {
    @Getter
    private Map<String, WorkspaceEntityDTO> workspaceIds;

    @Autowired
    private Environment environment;

    @PostConstruct
    public void init() {
        loadYamlConfig();
    }


    private void loadYamlConfig() {
//        String activeProfile = environment.getActiveProfiles().length > 0 ?
//                environment.getActiveProfiles()[0] : "local";
        String configFileName ="chat-workspace-config-local.yml";

        try {
            String yamlContent = SharedCommonUtils.getFileContents(configFileName);
            Yaml yaml = new Yaml(new Constructor(Map.class));
            Map<String, Object> data = yaml.load(new StringReader(yamlContent));

            if (data != null && data.containsKey("workspaceIds")) {
                @SuppressWarnings("unchecked")
                Map<String, Map<String, Object>> tenantIdsMap = (Map<String, Map<String, Object>>) data.get("workspaceIds");

                this.workspaceIds = new HashMap<>();
                for (Map.Entry<String, Map<String, Object>> entry : tenantIdsMap.entrySet()) {
                    WorkspaceEntityDTO workspaceEntityDTO = mapToWorkspaceEntityDTO(entry.getValue());
                    this.workspaceIds.put(entry.getKey(), workspaceEntityDTO);
                }
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to load YAML configuration", e);
        }
    }

    
    private WorkspaceEntityDTO mapToWorkspaceEntityDTO(Map<String, Object> map) {
        WorkspaceEntityDTO dto = new WorkspaceEntityDTO();
        dto.setSchema((String) map.get("schema"));
        return dto;
    }
}