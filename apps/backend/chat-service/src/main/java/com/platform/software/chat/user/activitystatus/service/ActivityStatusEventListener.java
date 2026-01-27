package com.platform.software.chat.user.activitystatus.service;

import com.platform.software.chat.user.activitystatus.dto.ActivityStatusEvent;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;


@Component
public class ActivityStatusEventListener {
    private final UserActivityStatusWSService userActivityStatusWSService;

    public ActivityStatusEventListener(UserActivityStatusWSService userActivityStatusWSService) {
        this.userActivityStatusWSService = userActivityStatusWSService;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onActivityStatusChange(ActivityStatusEvent event) {
        userActivityStatusWSService.invokeUserActivityStatus(
                event.workspaceId(),
                event.email(),
                event.status(),
                event.deviceType()
        );
    }
}
