package com.aprovaenem.exam.domain.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Domain Commands and Models Branch Coverage Tests")
class DomainCommandsAndModelsTest {

    @Test
    @DisplayName("AiQuotaStatus branch coverage for unlimited and standard quotas")
    void shouldCoverAiQuotaStatusBranches() {
        Instant resetsAt = Instant.now().plusSeconds(3600);

        AiQuotaStatus unlimited = AiQuotaStatus.unlimited(resetsAt);
        assertThat(unlimited.isUnlimited()).isTrue();
        assertThat(unlimited.hasAvailableQuota()).isTrue();
        assertThat(unlimited.getDailyLimit()).isEqualTo(Integer.MAX_VALUE);
        assertThat(unlimited.getUsedToday()).isZero();
        assertThat(unlimited.getRemainingToday()).isEqualTo(Integer.MAX_VALUE);
        assertThat(unlimited.getResetsAt()).isEqualTo(resetsAt);

        // Standard with remaining > 0
        AiQuotaStatus standardWithQuota = AiQuotaStatus.standard(10, 3, resetsAt);
        assertThat(standardWithQuota.isUnlimited()).isFalse();
        assertThat(standardWithQuota.hasAvailableQuota()).isTrue();
        assertThat(standardWithQuota.getDailyLimit()).isEqualTo(10);
        assertThat(standardWithQuota.getUsedToday()).isEqualTo(3);
        assertThat(standardWithQuota.getRemainingToday()).isEqualTo(7);

        // Standard with exhausted quota (used >= limit)
        AiQuotaStatus exhausted = AiQuotaStatus.standard(10, 12, resetsAt);
        assertThat(exhausted.hasAvailableQuota()).isFalse();
        assertThat(exhausted.getRemainingToday()).isZero();
    }

    @Test
    @DisplayName("StartSessionCommand branch coverage for default and boundary values")
    void shouldCoverStartSessionCommandBranches() {
        UUID userId = UUID.randomUUID();
        UUID topicId = UUID.randomUUID();

        // Parameterized constructor with null sessionType and non-positive totalQuestions
        StartSessionCommand cmd1 = new StartSessionCommand(
                userId, "anon-1", null, topicId, DifficultyLevel.EASY, 0
        );
        assertThat(cmd1.getSessionType()).isEqualTo(SessionType.TOPIC_PRACTICE);
        assertThat(cmd1.getTotalQuestions()).isEqualTo(10);
        assertThat(cmd1.getUserId()).isEqualTo(userId);
        assertThat(cmd1.getAnonymousSessionId()).isEqualTo("anon-1");
        assertThat(cmd1.getTopicId()).isEqualTo(topicId);
        assertThat(cmd1.getDifficulty()).isEqualTo(DifficultyLevel.EASY);

        // Negative total questions setter
        cmd1.setTotalQuestions(-5);
        assertThat(cmd1.getTotalQuestions()).isEqualTo(10);

        // Positive total questions setter
        cmd1.setTotalQuestions(15);
        assertThat(cmd1.getTotalQuestions()).isEqualTo(15);

        // Default constructor & setters
        StartSessionCommand cmd2 = new StartSessionCommand();
        cmd2.setUserId(userId);
        cmd2.setAnonymousSessionId("anon-2");
        cmd2.setSessionType(SessionType.EXAM_SIMULATION);
        cmd2.setTopicId(topicId);
        cmd2.setDifficulty(DifficultyLevel.HARD);
        assertThat(cmd2.getSessionType()).isEqualTo(SessionType.EXAM_SIMULATION);
    }

    @Test
    @DisplayName("TutorChatMessage branch coverage for null parameters fallback")
    void shouldCoverTutorChatMessageBranches() {
        UUID msgId = UUID.randomUUID();
        UUID threadId = UUID.randomUUID();

        TutorChatMessage msg = new TutorChatMessage(
                msgId, threadId, ChatRole.STUDENT, "Pergunta", null, null, null, null
        );

        assertThat(msg.getId()).isEqualTo(msgId);
        assertThat(msg.getThreadId()).isEqualTo(threadId);
        assertThat(msg.getRole()).isEqualTo(ChatRole.STUDENT);
        assertThat(msg.getContent()).isEqualTo("Pergunta");
        assertThat(msg.getPromptTokens()).isZero();
        assertThat(msg.getCompletionTokens()).isZero();
        assertThat(msg.getModelUsed()).isEqualTo("gemini-1.5-flash");
        assertThat(msg.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("QuestionFilterCommand branch coverage for negative page and non-positive size")
    void shouldCoverQuestionFilterCommandBranches() {
        UUID topicId = UUID.randomUUID();

        QuestionFilterCommand cmd = new QuestionFilterCommand(
                topicId, "Física", DifficultyLevel.MEDIUM, "óptica", QuestionStatus.ACTIVE, -2, -5
        );
        assertThat(cmd.getPage()).isZero();
        assertThat(cmd.getSize()).isEqualTo(20);
        assertThat(cmd.getTopicId()).isEqualTo(topicId);
        assertThat(cmd.getDiscipline()).isEqualTo("Física");
        assertThat(cmd.getDifficulty()).isEqualTo(DifficultyLevel.MEDIUM);
        assertThat(cmd.getSearch()).isEqualTo("óptica");
        assertThat(cmd.getStatus()).isEqualTo(QuestionStatus.ACTIVE);

        cmd.setPage(-10);
        assertThat(cmd.getPage()).isZero();
        cmd.setPage(3);
        assertThat(cmd.getPage()).isEqualTo(3);

        cmd.setSize(0);
        assertThat(cmd.getSize()).isEqualTo(20);
        cmd.setSize(50);
        assertThat(cmd.getSize()).isEqualTo(50);

        QuestionFilterCommand empty = new QuestionFilterCommand();
        empty.setTopicId(topicId);
        empty.setDiscipline("Química");
        empty.setDifficulty(DifficultyLevel.EASY);
        empty.setSearch("estequiometria");
        empty.setStatus(QuestionStatus.DRAFT);
        assertThat(empty.getDiscipline()).isEqualTo("Química");
    }

    @Test
    @DisplayName("TutorConsultationResult and QuestionOption coverage")
    void shouldCoverConsultationResultAndOption() {
        AiQuotaStatus quota = AiQuotaStatus.unlimited(Instant.now());

        TutorConsultationResult result = new TutorConsultationResult(
                UUID.randomUUID(), UUID.randomUUID(), "Resposta socrática", 2, 6, quota, false, null, null
        );
        assertThat(result.getResponseText()).isEqualTo("Resposta socrática");
        assertThat(result.getTurnCount()).isEqualTo(2);
        assertThat(result.getMaxTurns()).isEqualTo(6);
        assertThat(result.getQuotaStatus()).isEqualTo(quota);
        assertThat(result.isFallback()).isFalse();
        assertThat(result.getRetrievedChunks()).isEmpty();
        assertThat(result.getTimestamp()).isNotNull();
        assertThat(result.getThreadId()).isNotNull();
        assertThat(result.getQuestionId()).isNotNull();

        UUID optId = UUID.randomUUID();
        UUID qId = UUID.randomUUID();
        QuestionOption opt = new QuestionOption(optId, qId, 'A', "Texto", false);
        assertThat(opt.getId()).isEqualTo(optId);
        assertThat(opt.getQuestionId()).isEqualTo(qId);
        assertThat(opt.getOptionLetter()).isEqualTo('A');
        assertThat(opt.getOptionText()).isEqualTo("Texto");
        assertThat(opt.isCorrect()).isFalse();
    }
}
