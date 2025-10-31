package com.platform.software.platform.workspaceuser.repository;

import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceUserRepository extends JpaRepository<WorkspaceUser, Long>, WorkspaceUserQueryRepository {
    List<WorkspaceUser> findAllByEmail(@NotBlank String email);

    Optional<WorkspaceUser> findByEmailAndWorkspace_Id(@NotBlank String email, @NotBlank Long workspaceIdd);

    Optional<WorkspaceUser> findByEmailAndWorkspace_Name(@NotBlank String email, @NotBlank String workspaceName);

    Optional<WorkspaceUser> findByEmailAndWorkspace_WorkspaceIdentifier(String email, String workspaceWorkspaceIdentifier);
}
