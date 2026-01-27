package com.platform.software.chat.user.activitystatus.service;

import com.platform.software.chat.notification.entity.DeviceType;
import com.platform.software.chat.user.activitystatus.dto.UserActivityInfo;
import com.platform.software.chat.user.activitystatus.dto.UserStatusEnum;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Service;

import java.util.concurrent.*;


@Service
public class UserActivityStatusService {

    private final UserActivityStatusWSService userActivityStatusWSService;

    private final ConcurrentHashMap<String, UserActivityInfo> userPresence = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, ScheduledFuture<?>> offlineSchedulers = new ConcurrentHashMap<>();
    private final ScheduledThreadPoolExecutor scheduler;

    public UserActivityStatusService(UserActivityStatusWSService userActivityStatusWSService) {
        this.userActivityStatusWSService = userActivityStatusWSService;
        int poolSize = Math.max(4, Runtime.getRuntime().availableProcessors());

        ScheduledThreadPoolExecutor executor = new ScheduledThreadPoolExecutor(
                poolSize,
                new ThreadPoolExecutor.CallerRunsPolicy()
        );
        executor.setRemoveOnCancelPolicy(true);
        executor.setKeepAliveTime(60, TimeUnit.SECONDS);
        executor.allowCoreThreadTimeOut(true);

        this.scheduler = executor;
    }

    @PostConstruct
    public void init() {
        // clean up offline users older than 24 hours
        scheduler.scheduleAtFixedRate(() -> {
            long now = System.currentTimeMillis();
            userPresence.entrySet().removeIf(entry -> {
                UserActivityInfo info = entry.getValue();
                return info.getStatus() == UserStatusEnum.OFFLINE
                        && (now - info.getLastUpdated()) > TimeUnit.HOURS.toMillis(24);
            });
        }, 1, 1, TimeUnit.HOURS);
    }

    /**
     * Marks a user as online (or updates their presence state) and broadcasts the change
     * if the status has been modified.
     * <p>
     * Any previously scheduled task that would mark the user as offline is cancelled
     * to prevent stale presence updates.
     * </p>
     *
     * @param email           unique identifier of the user
     * @param workspace       workspace in which the user's presence is tracked
     * @param deviceType      device type from which the user is connected (e.g. web, mobile)
     * @param userStatusEnum  current activity status of the user
     */
    public void invokeUserOnline(String email, String workspace, String deviceType, UserStatusEnum userStatusEnum) {
        //cancel any scheduled offline task
        ScheduledFuture<?> pendingOfflineTask = offlineSchedulers.remove(email);
        if (pendingOfflineTask != null) {
            pendingOfflineTask.cancel(false);
        }

        //broadcast as online
        UserActivityInfo currentPresence = userPresence.get(email);
        if (currentPresence == null || currentPresence.getStatus() != userStatusEnum) {
            userPresence.put(email, new UserActivityInfo(workspace, email, userStatusEnum, DeviceType.fromString(deviceType)));
            userActivityStatusWSService.invokeUserActivityStatus(workspace, email, userStatusEnum, deviceType);
        }
    }

    /**
     * Marks a user as away immediately and schedules a task to mark them as offline
     * after a predefined timeout (15 minutes).
     * <p>
     * Any previously scheduled task that would mark the user as offline is cancelled
     * to prevent multiple concurrent offline tasks.
     * </p>
     *
     * @param email       unique identifier of the user
     * @param workspace   workspace in which the user's presence is tracked
     * @param deviceType  device type from which the user is connected (e.g. web, mobile)
     */
    public void invokeUserOffline(String email, String workspace , String deviceType) {

        ScheduledFuture<?> existingTask = offlineSchedulers.remove(email);
        if (existingTask != null) {
            existingTask.cancel(false);
        }

        //broadcast as away
        userPresence.put(email, new UserActivityInfo(workspace, email, UserStatusEnum.AWAY, DeviceType.fromString(deviceType)));
        userActivityStatusWSService.invokeUserActivityStatus(workspace, email, UserStatusEnum.AWAY, deviceType);

        //broadcast as offline after 15 minutes
        ScheduledFuture<?> offlineTask = scheduler.schedule(() -> {
            UserActivityInfo presence = userPresence.get(email);
            if (presence != null && presence.getStatus().equals(UserStatusEnum.AWAY)) {
                userPresence.put(email, new UserActivityInfo(workspace, email, UserStatusEnum.OFFLINE, DeviceType.fromString(deviceType)));
                userActivityStatusWSService.invokeUserActivityStatus(workspace, email, UserStatusEnum.OFFLINE, deviceType);
                offlineSchedulers.remove(email);
            }
        }, 15, TimeUnit.MINUTES);

        offlineSchedulers.put(email, offlineTask);
    }

    @PreDestroy
    public void cleanup() {
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

}
