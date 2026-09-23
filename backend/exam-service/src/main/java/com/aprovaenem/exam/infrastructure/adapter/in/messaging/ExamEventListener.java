package com.aprovaenem.exam.infrastructure.adapter.in.messaging;

import com.aprovaenem.common.events.UserDeletedEvent;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataPracticeSessionRepository;
import com.aprovaenem.exam.infrastructure.adapter.out.persistence.repository.SpringDataTutorChatThreadRepository;
import com.aprovaenem.exam.infrastructure.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExamEventListener {

    private final SpringDataPracticeSessionRepository practiceSessionRepository;
    private final SpringDataTutorChatThreadRepository tutorChatThreadRepository;

    @RabbitListener(queues = RabbitMQConfig.EXAM_LGPD_QUEUE)
    public void handleUserDeleted(UserDeletedEvent event) {
        log.info("Received UserDeletedEvent for user [{}]. Scrubbing PII under LGPD Art. 18 / Art. 16, II", event.getUserId());
        int anonymizedCount = practiceSessionRepository.anonymizeSessionsByUserId(event.getUserId());
        tutorChatThreadRepository.deleteByUserId(event.getUserId());
        log.info("LGPD Art. 18 Anonymization: Scrubbed [{}] practice sessions (userId set to null) and purged AI tutor chats for user [{}]",
                anonymizedCount, event.getUserId());
    }
}
