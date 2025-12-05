package com.platform.software.controller.external;

import com.platform.software.platform.workspace.service.WorkspaceService;
import io.swagger.annotations.ApiOperation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/protected/workspaces")
public class PublicWorkspaceController {

    private final WorkspaceService workspaceService;

    public PublicWorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @ApiOperation(value = "Get all workspaces", response = List.class)
    @GetMapping
    public ResponseEntity<List<String>> getWorkspaces() {
        return ResponseEntity.ok(workspaceService.getAllWorkspaces());
    }
}
