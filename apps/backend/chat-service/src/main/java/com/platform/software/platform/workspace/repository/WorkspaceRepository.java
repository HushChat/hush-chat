package com.platform.software.platform.workspace.repository;

import com.platform.software.platform.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    boolean existsByName(String name);
    Optional<Workspace> findByWorkspaceIdentifier(String name);
    List<Workspace> findAllByWorkspaceIdentifierIsNotNull();
}
