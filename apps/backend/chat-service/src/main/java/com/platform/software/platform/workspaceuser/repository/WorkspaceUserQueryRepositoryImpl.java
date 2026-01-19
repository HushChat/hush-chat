package com.platform.software.platform.workspaceuser.repository;


import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomForbiddenException;
import com.platform.software.platform.workspace.entity.QWorkspace;
import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.platform.workspaceuser.entity.QWorkspaceUser;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUserRole;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUserStatus;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

public class WorkspaceUserQueryRepositoryImpl implements WorkspaceUserQueryRepository {
    Logger logger = LoggerFactory.getLogger(WorkspaceUserQueryRepositoryImpl.class);
    private final JPAQueryFactory jpaQueryFactory;

    private static final QWorkspaceUser qWorkspaceUser = QWorkspaceUser.workspaceUser;
    private static final QWorkspace qWorkspace = QWorkspace.workspace;

    public WorkspaceUserQueryRepositoryImpl(JPAQueryFactory jpaQueryFactory) {
        this.jpaQueryFactory = jpaQueryFactory;
    }

    @Override
    public Workspace findPendingWorkspaceByUserEmailOrThrow(String email, String currantWorkspace) {
        Workspace workspace = jpaQueryFactory
            .select(qWorkspace)
            .from(qWorkspaceUser)
            .join(qWorkspaceUser.workspace, qWorkspace)
            .where(qWorkspaceUser.email.eq(email)
                    .and(qWorkspace.workspaceIdentifier.eq(currantWorkspace))
                    .and(qWorkspaceUser.status.eq(WorkspaceUserStatus.PENDING)))
            .fetchOne();

        if (workspace == null) {
            logger.info("No pending invitation found for email: {}", email);
            throw new CustomBadRequestException("No pending invitation found for the given email");
        }

        return workspace;
    }

    @Override
    public Workspace validateWorkspaceMembershipOrThrow(String inviterEmail, String workspaceIdentifier){
        Workspace workspace = jpaQueryFactory
                .select(qWorkspace)
                .from(qWorkspaceUser)
                .join(qWorkspaceUser.workspace, qWorkspace)
                .where(qWorkspaceUser.email.eq(inviterEmail)
                        .and(qWorkspace.workspaceIdentifier.eq(workspaceIdentifier))
                        .and(qWorkspaceUser.status.ne(WorkspaceUserStatus.PENDING))
                        .and(qWorkspaceUser.role.eq(WorkspaceUserRole.ADMIN)))
                .fetchOne();
        if (workspace == null) {
            logger.info("User: {} does not have permission to invite to workspace: {}", inviterEmail, workspaceIdentifier);
            throw new CustomForbiddenException("You don't have permission to invite users to this workspace or invalid workspace name");
        } else {
            return workspace;
        }
    }

    @Override
    public WorkspaceUser validateWorkspaceAccess(String workspaceIdentifier, String email) {
        return jpaQueryFactory
                .selectFrom(qWorkspaceUser)
                .join(qWorkspaceUser.workspace, qWorkspace)
                .where(
                        qWorkspaceUser.email.eq(email)
                                .and(qWorkspace.workspaceIdentifier.eq(workspaceIdentifier))
                                .and(qWorkspaceUser.status.ne(WorkspaceUserStatus.SUSPENDED))
                )
                .fetchFirst();
    }

    public Page<WorkspaceUser> fetchWorkspaceUsersPage(Pageable pageable) {

        JPAQuery<WorkspaceUser> query = jpaQueryFactory
                .select(qWorkspaceUser)
                .from(qWorkspaceUser);

        long total = query.fetchCount();

        List<WorkspaceUser> results = query
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        return new PageImpl<>(results, pageable, total);
    }
}
