package com.aprovaenem.auth.domain.port.out;

import com.aprovaenem.common.events.DailyGoalReminderEvent;

public interface NotificationPublisherPort {

    void publishStudyReminder(DailyGoalReminderEvent event);
}
