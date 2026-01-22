package com.platform.software.platform.workspace.repository;

import com.platform.software.platform.workspace.entity.AllowedIp;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Set;

public interface AllowedIpRepository extends JpaRepository<AllowedIp, Long> {
    @Query("select a.ipAddress from AllowedIp a where a.workspace.workspaceIdentifier = :workspaceId")
    Set<String> findAllowedIpAddresses(@Param("workspaceId") String workspaceId);
}
