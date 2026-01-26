package com.platform.software.platform.workspace.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;

@Data
public class WorkspaceAllowedIpUpsertDTO {
    @NotNull
    private List<@Pattern(
            regexp = "^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$",
            message = "Invalid IPv4 address"
    ) String> ipAddresses;
}
