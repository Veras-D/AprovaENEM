package com.aprovaenem.notification.infrastructure.adapter.in.messaging;

import com.aprovaenem.common.events.DailyGoalReminderEvent;
import com.aprovaenem.common.events.EmailVerificationRequestedEvent;
import com.aprovaenem.common.events.PasswordResetRequestedEvent;
import com.aprovaenem.common.events.UserDeletedEvent;
import com.aprovaenem.common.events.UserRegisteredEvent;
import com.aprovaenem.notification.application.port.out.EmailDeliveryException;
import com.aprovaenem.notification.application.port.out.EmailSenderPort;
import com.aprovaenem.notification.infrastructure.config.RabbitMQConfig;
import com.aprovaenem.notification.infrastructure.persistence.entity.NotificationLogEntity;
import com.aprovaenem.notification.infrastructure.persistence.repository.NotificationLogRepository;
import com.aprovaenem.notification.infrastructure.persistence.repository.UserDeviceTokenRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

import java.time.Instant;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationLogRepository notificationLogRepository;
    private final UserDeviceTokenRepository userDeviceTokenRepository;
    private final EmailSenderPort emailSender;
    private final ObjectMapper objectMapper;

    @Value("${app.frontend.url:http://localhost}")
    private String frontendUrl = "http://localhost";

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_USER_REGISTERED_QUEUE)
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("Received UserRegisteredEvent for user [{}] ({})", event.getUserId(), event.getEmail());
        Instant now = Instant.now();
        String name = event.getFullName() != null && !event.getFullName().isBlank() ? event.getFullName() : "Estudante";

        String title = "🎓 Boas-vindas ao AprovaENEM!";
        String body = String.format("Olá, %s! Seu cadastro foi concluído com sucesso. Inicie seu Diagnóstico ou explore o Banco de Questões.", name);

        String metadataJson = toJson(Map.of(
                "category", "ONBOARDING",
                "iconName", "GraduationCap",
                "targetSection", "diagnostic",
                "actionLabel", "Fazer Diagnóstico",
                "userId", event.getUserId() != null ? event.getUserId().toString() : "",
                "role", event.getRole() != null ? event.getRole() : "STUDENT"
        ));

        NotificationLogEntity inAppLog = NotificationLogEntity.builder()
                .userId(event.getUserId())
                .channel("IN_APP")
                .templateCode("WELCOME_USER")
                .title(title)
                .body(body)
                .metadata(metadataJson)
                .status("SENT")
                .sentAt(now)
                .createdAt(now)
                .build();

        notificationLogRepository.save(inAppLog);
        log.info("Persisted welcome notification for newly registered user [{}]", event.getUserId());
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_REMINDERS_QUEUE)
    public void handleDailyGoalReminder(DailyGoalReminderEvent event) {
        log.info("Received DailyGoalReminderEvent for user [{}]", event.getUserId());
        Instant now = Instant.now();
        int remaining = Math.max(1, event.getTargetQuestions() - event.getQuestionsCompleted());
        String name = event.getFullName() != null && !event.getFullName().isBlank() ? event.getFullName() : "Estudante";

        String title = "🔥 Proteja sua ofensiva!";
        String body = String.format(
                "Faltam apenas %d questões para atingir sua meta diária e manter sua ofensiva de %d dias viva.",
                remaining, event.getStreakDays());

        String metadataJson = toJson(Map.of(
                "category", "REMINDER",
                "iconName", "Flame",
                "targetSection", "practice",
                "actionLabel", "Praticar Agora",
                "streakDays", event.getStreakDays(),
                "targetQuestions", event.getTargetQuestions(),
                "questionsCompleted", event.getQuestionsCompleted()
        ));

        NotificationLogEntity entity = NotificationLogEntity.builder()
                .userId(event.getUserId())
                .channel("IN_APP")
                .templateCode("DAILY_STREAK_REMINDER")
                .title(title)
                .body(body)
                .metadata(metadataJson)
                .status("SENT")
                .sentAt(now)
                .createdAt(now)
                .build();

        notificationLogRepository.save(entity);
        log.info("Persisted IN_APP reminder notification for user [{}]", event.getUserId());

        if (event.getEmail() != null && !event.getEmail().isBlank()) {
            String emailStatus = deliverDailyReminderEmail(event, name);
            if (!"SKIPPED".equals(emailStatus)) {
                NotificationLogEntity emailEntity = NotificationLogEntity.builder()
                        .userId(event.getUserId())
                        .channel("EMAIL")
                        .templateCode("DAILY_STREAK_REMINDER")
                        .title(title)
                        .body(body)
                        .metadata(metadataJson)
                        .status(emailStatus)
                        .sentAt("SENT".equals(emailStatus) ? now : null)
                        .createdAt(now)
                        .build();

                notificationLogRepository.save(emailEntity);
                log.info("Persisted EMAIL reminder notification log for user [{}] with status [{}]",
                        event.getUserId(), emailStatus);
            }
        }
    }

    private String deliverDailyReminderEmail(DailyGoalReminderEvent event, String name) {
        if (event.getEmail() == null || event.getEmail().isBlank()) {
            log.warn("Skipping daily reminder email for user [{}]: missing recipient email", event.getUserId());
            return "FAILED";
        }
        if (!isDeliverableRecipient(event.getEmail())) {
            log.info("Skipping daily reminder email for user [{}] with mock or test recipient [{}]",
                    event.getUserId(), event.getEmail());
            return "SKIPPED";
        }

        int remaining = Math.max(1, event.getTargetQuestions() - event.getQuestionsCompleted());
        int progressPct = event.getTargetQuestions() > 0
                ? Math.min(100, (int) Math.round(((double) event.getQuestionsCompleted() * 100.0) / event.getTargetQuestions()))
                : 0;

        String subject = event.getStreakDays() > 0
                ? String.format("🔥 Proteja sua ofensiva de %d dias no AprovaENEM!", event.getStreakDays())
                : "🔥 Hora de praticar no AprovaENEM! Conquiste sua meta diária";

        String practiceUrl = frontendUrl + "/?section=practice";
        String profileUrl = frontendUrl + "/?section=profile";

        String textFallback = String.format(
                "Olá, %s!%n%n"
                        + "🔥 Proteja sua ofensiva no AprovaENEM!%n"
                        + "Você tem %d dia(s) de ofensiva ativa.%n"
                        + "Hoje você completou %d de %d questões.%n"
                        + "Faltam apenas %d questão(ões) para cumprir sua meta diária!%n%n"
                        + "Pratique agora: %s%n",
                name, event.getStreakDays(), event.getQuestionsCompleted(), event.getTargetQuestions(), remaining, practiceUrl);

        String html = buildDailyReminderHtml(event, name, remaining, progressPct, practiceUrl, profileUrl);

        try {
            emailSender.sendHtml(event.getEmail(), subject, html, textFallback);
            return "SENT";
        } catch (EmailDeliveryException e) {
            log.error("Could not deliver daily study reminder email to [{}]", event.getEmail(), e);
            return "FAILED";
        }
    }

    private String buildDailyReminderHtml(DailyGoalReminderEvent event, String name, int remaining,
                                          int progressPct, String practiceUrl, String profileUrl) {
        String streakLabel = event.getStreakDays() == 1 ? "Dia de Ofensiva" : "Dias de Ofensiva";
        String streakMessage = event.getStreakDays() > 0
                ? "Não deixe sua sequência zerar hoje! Pratique agora para manter o ritmo."
                : "Comece hoje sua sequência de estudos rumo à nota 800+ no ENEM!";

        String template = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>🔥 Lembrete Diário AprovaENEM</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:32px auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#ea580c 0%,#c2410c 100%);padding:28px 24px;text-align:center;color:#ffffff;">
      <h1 style="margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">🔥 AprovaENEM</h1>
      <p style="margin:4px 0 0 0;font-size:13px;opacity:0.9;">Lembrete Diário de Estudos & Ofensiva</p>
    </div>
    <div style="padding:32px 24px;">
      <div style="font-size:18px;font-weight:700;margin-bottom:12px;color:#0f172a;">Olá, {{NAME}}!</div>
      <p style="font-size:15px;line-height:1.6;color:#475569;margin-bottom:20px;">
        Seu futuro no ENEM é construído um pouco a cada dia. Não deixe seu dia passar em branco!
      </p>

      <div style="background:linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%);
                  border:2px solid #fdba74;border-radius:16px;padding:20px;text-align:center;margin:24px 0;">
        <div style="font-size:44px;line-height:1;margin-bottom:8px;">🔥</div>
        <div style="font-size:32px;font-weight:800;color:#ea580c;letter-spacing:-0.5px;font-family:monospace;">
          {{STREAK_DAYS}} {{STREAK_LABEL}}
        </div>
        <div style="font-size:13px;color:#9a3412;font-weight:600;margin-top:6px;">
          {{STREAK_MESSAGE}}
        </div>
      </div>

      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:14px;font-weight:700;color:#334155;">
          <span>Meta Diária</span>
          <span style="color:#ea580c;font-family:monospace;">{{QUESTIONS_COMPLETED}} / {{TARGET_QUESTIONS}} questões</span>
        </div>
        <div style="background-color:#e2e8f0;border-radius:9999px;height:12px;width:100%;overflow:hidden;margin-bottom:12px;">
          <div style="background:linear-gradient(90deg,#f97316 0%,#ea580c 100%);
                      height:100%;border-radius:9999px;width:{{PROGRESS_PERCENT}}%;"></div>
        </div>
        <div style="font-size:13px;color:#64748b;line-height:1.5;">
          ⚡ <strong>Faltam apenas {{REMAINING}} questão(ões)</strong> para cumprir sua meta hoje e garantir seu bônus de consistência!
        </div>
      </div>

      <div style="text-align:center;margin:32px 0 16px 0;">
        <a href="{{PRACTICE_URL}}"
           style="display:inline-block;background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);
                  color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;padding:16px 36px;border-radius:12px;
                  box-shadow:0 4px 14px rgba(234,88,12,0.35);text-transform:uppercase;letter-spacing:0.5px;">
          🎯 Praticar Agora
        </a>
      </div>
      <div style="text-align:center;font-size:12px;color:#94a3b8;margin-bottom:8px;">
        Leva menos de 5 minutos para resolver questões com o Tutor IA Socrático.
      </div>
    </div>
    <div style="padding:20px 24px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;line-height:1.5;">
      Você está recebendo este e-mail porque possui lembretes diários ativos no <strong>AprovaENEM</strong>.<br/>
      Para gerenciar suas preferências, acesse seu <a href="{{PROFILE_URL}}" style="color:#64748b;text-decoration:underline;">perfil</a>.
    </div>
  </div>
</body>
</html>
""";

        return template
                .replace("{{NAME}}", HtmlUtils.htmlEscape(name))
                .replace("{{STREAK_DAYS}}", String.valueOf(event.getStreakDays()))
                .replace("{{STREAK_LABEL}}", streakLabel)
                .replace("{{STREAK_MESSAGE}}", streakMessage)
                .replace("{{QUESTIONS_COMPLETED}}", String.valueOf(event.getQuestionsCompleted()))
                .replace("{{TARGET_QUESTIONS}}", String.valueOf(event.getTargetQuestions()))
                .replace("{{PROGRESS_PERCENT}}", String.valueOf(progressPct))
                .replace("{{REMAINING}}", String.valueOf(remaining))
                .replace("{{PRACTICE_URL}}", practiceUrl)
                .replace("{{PROFILE_URL}}", profileUrl);
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_AUTH_QUEUE)
    public void handleEmailVerification(EmailVerificationRequestedEvent event) {
        if (event == null || event.getVerificationToken() == null || event.getVerificationToken().isBlank()) {
            log.warn("Skipping EmailVerificationRequestedEvent: missing verification token for user [{}]",
                    event != null ? event.getUserId() : null);
            return;
        }
        log.info("Received EmailVerificationRequestedEvent for user [{}]", event.getUserId());
        Instant now = Instant.now();

        String title = "Confirme seu e-mail no AprovaENEM";
        String name = event.getFullName() != null ? event.getFullName() : "Estudante";

        String metadataJson = toJson(Map.of(
                "category", "UPDATE",
                "iconName", "ShieldAlert",
                "targetSection", "profile",
                "actionLabel", "Ver Perfil",
                "email", event.getEmail() != null ? event.getEmail() : ""
        ));

        String status = deliverVerificationEmail(event, name);
        if (!"SKIPPED".equals(status)) {
            String body = "SENT".equals(status)
                    ? String.format("Olá %s! Enviamos um e-mail de confirmação para ativar sua conta AprovaENEM. "
                            + "Verifique sua caixa de entrada e informe o código recebido.", name)
                    : String.format("Olá %s! Não conseguimos enviar o e-mail de confirmação agora. "
                            + "Acesse seu perfil e solicite o reenvio.", name);

            NotificationLogEntity entity = NotificationLogEntity.builder()
                    .userId(event.getUserId())
                    .channel("EMAIL")
                    .templateCode("EMAIL_VERIFICATION")
                    .title(title)
                    .body(body)
                    .metadata(metadataJson)
                    .status(status)
                    .sentAt("SENT".equals(status) ? now : null)
                    .createdAt(now)
                    .build();

            notificationLogRepository.save(entity);
            log.info("Persisted EMAIL verification notification log for [{}] with status [{}]", event.getEmail(), status);
        }
    }

    private String deliverVerificationEmail(EmailVerificationRequestedEvent event, String name) {
        if (event.getEmail() == null || event.getEmail().isBlank() || event.getVerificationToken() == null) {
            log.warn("Skipping verification email for user [{}]: missing recipient or token", event.getUserId());
            return "FAILED";
        }
        if (!isDeliverableRecipient(event.getEmail())) {
            log.info("Skipping verification email for user [{}] with mock or test recipient [{}]",
                    event.getUserId(), event.getEmail());
            return "SKIPPED";
        }

        String textFallback = String.format(
                "Olá %s!%n%nBem-vindo(a) ao AprovaENEM.%nPara ativar sua conta e liberar o simulado com o Tutor IA Socrático, "
                        + "informe o seguinte código no aplicativo:%n%n    %s%n%n(Código de confirmação válido por 24 horas)%n",
                name, event.getVerificationToken());

        String html = buildVerificationHtml(name, event.getVerificationToken());

        try {
            emailSender.sendHtml(event.getEmail(), "Confirme seu e-mail no AprovaENEM", html, textFallback);
            return "SENT";
        } catch (EmailDeliveryException e) {
            log.error("Could not deliver verification email to [{}]", event.getEmail(), e);
            return "FAILED";
        }
    }

    private String buildVerificationHtml(String name, String token) {
        String template = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirme seu e-mail no AprovaENEM</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:32px auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#0284c7 0%,#0369a1 100%);padding:32px 24px;text-align:center;color:#ffffff;">
      <h1 style="margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">🎓 AprovaENEM</h1>
    </div>
    <div style="padding:32px 24px;">
      <div style="font-size:18px;font-weight:700;margin-bottom:12px;color:#0f172a;">Olá, {{NAME}}!</div>
      <p style="font-size:15px;line-height:1.6;color:#475569;margin-bottom:24px;">
        Obrigado por criar sua conta no <strong>AprovaENEM</strong>. Para ativar seu acesso e liberar o simulado com o Tutor IA Socrático,
        informe o código de confirmação abaixo no aplicativo:
      </p>
      <div style="background-color:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;padding:24px 20px;text-align:center;margin:28px 0;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:10px;">
          Código de Confirmação
        </div>
        <div style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:800;color:#0284c7;letter-spacing:10px;">
          {{TOKEN}}
        </div>
      </div>
      <p style="font-size:13px;color:#64748b;margin-bottom:0;text-align:center;">
        ⚠️ Este código de confirmação expira em 24 horas.
      </p>
    </div>
    <div style="padding:20px 24px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:13px;color:#94a3b8;">
      Se você não criou uma conta no AprovaENEM, ignore esta mensagem com segurança.
    </div>
  </div>
</body>
</html>
""";
        return template
                .replace("{{NAME}}", HtmlUtils.htmlEscape(name))
                .replace("{{TOKEN}}", HtmlUtils.htmlEscape(token));
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_PASSWORD_RESET_QUEUE)
    public void handlePasswordReset(PasswordResetRequestedEvent event) {
        if (event == null || event.getResetToken() == null || event.getResetToken().isBlank()) {
            log.warn("Skipping PasswordResetRequestedEvent: missing reset token for user [{}]",
                    event != null ? event.getUserId() : null);
            return;
        }
        log.info("Received PasswordResetRequestedEvent for user [{}]", event.getUserId());
        Instant now = Instant.now();

        String title = "Recuperação de Senha no AprovaENEM";
        String name = event.getFullName() != null && !event.getFullName().isBlank() ? event.getFullName() : "Estudante";

        String metadataJson = toJson(Map.of(
                "category", "SECURITY",
                "iconName", "KeyRound",
                "targetSection", "auth",
                "actionLabel", "Redefinir Senha",
                "email", event.getEmail() != null ? event.getEmail() : ""
        ));

        String status = deliverPasswordResetEmail(event, name);
        if (!"SKIPPED".equals(status)) {
            String body = "SENT".equals(status)
                    ? String.format("Olá %s! Enviamos um link seguro para recuperação da sua senha AprovaENEM. "
                            + "Verifique sua caixa de entrada e clique no link para cadastrar uma nova senha.", name)
                    : String.format("Olá %s! Não conseguimos enviar o e-mail de recuperação de senha agora.", name);

            NotificationLogEntity entity = NotificationLogEntity.builder()
                    .userId(event.getUserId())
                    .channel("EMAIL")
                    .templateCode("PASSWORD_RESET")
                    .title(title)
                    .body(body)
                    .metadata(metadataJson)
                    .status(status)
                    .sentAt("SENT".equals(status) ? now : null)
                    .createdAt(now)
                    .build();

            notificationLogRepository.save(entity);
            log.info("Persisted EMAIL password reset notification log for [{}] with status [{}]", event.getEmail(), status);
        }
    }

    private String deliverPasswordResetEmail(PasswordResetRequestedEvent event, String name) {
        if (event.getEmail() == null || event.getEmail().isBlank() || event.getResetToken() == null) {
            log.warn("Skipping password reset email for user [{}]: missing recipient or token", event.getUserId());
            return "FAILED";
        }
        if (!isDeliverableRecipient(event.getEmail())) {
            log.info("Skipping password reset email for user [{}] with mock or test recipient [{}]",
                    event.getUserId(), event.getEmail());
            return "SKIPPED";
        }

        String resetUrl = String.format("%s/?resetToken=%s", frontendUrl, event.getResetToken());

        String textFallback = String.format(
                "Olá %s!%n%nRecebemos uma solicitação para redefinir a senha da sua conta no AprovaENEM.%n"
                        + "Para cadastrar uma nova senha com segurança, acesse o link abaixo:%n%n    %s%n%n(Link seguro válido por 24 horas)%n%n"
                        + "Se você não solicitou a redefinição de senha, ignore este e-mail.%n",
                name, resetUrl);

        String html = buildPasswordResetHtml(name, resetUrl);

        try {
            emailSender.sendHtml(event.getEmail(), "Recuperação de Senha — AprovaENEM", html, textFallback);
            return "SENT";
        } catch (EmailDeliveryException e) {
            log.error("Could not deliver password reset email to [{}]", event.getEmail(), e);
            return "FAILED";
        }
    }

    private String buildPasswordResetHtml(String name, String resetUrl) {
        String template = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recuperação de Senha no AprovaENEM</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:32px auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#0284c7 0%,#0369a1 100%);padding:32px 24px;text-align:center;color:#ffffff;">
      <h1 style="margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">🎓 AprovaENEM</h1>
    </div>
    <div style="padding:32px 24px;">
      <div style="font-size:18px;font-weight:700;margin-bottom:12px;color:#0f172a;">Olá, {{NAME}}!</div>
      <p style="font-size:15px;line-height:1.6;color:#475569;margin-bottom:24px;">
        Recebemos uma solicitação para redefinir a senha de acesso à sua conta <strong>AprovaENEM</strong>.
        Para cadastrar uma nova senha com segurança, clique no botão abaixo:
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="{{RESET_URL}}" style="display:inline-block;background:linear-gradient(135deg,#0284c7 0%,#0369a1 100%);color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 32px;border-radius:10px;box-shadow:0 4px 14px rgba(2,132,199,0.35);">
          Redefinir Minha Senha &rarr;
        </a>
      </div>
      <p style="font-size:13px;color:#64748b;margin-bottom:12px;text-align:center;line-height:1.5;">
        Se o botão acima não funcionar, copie e cole o seguinte link em seu navegador:<br/>
        <a href="{{RESET_URL}}" style="color:#0284c7;word-break:break-all;">{{RESET_URL}}</a>
      </p>
      <p style="font-size:13px;color:#94a3b8;margin-bottom:0;text-align:center;">
        ⚠️ Este link de recuperação expira em 24 horas. Se você não solicitou esta alteração, ignore este e-mail.
      </p>
    </div>
    <div style="padding:20px 24px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:13px;color:#94a3b8;">
      Equipe de Segurança da Informação — AprovaENEM
    </div>
  </div>
</body>
</html>
""";
        return template
                .replace("{{NAME}}", HtmlUtils.htmlEscape(name))
                .replace("{{RESET_URL}}", resetUrl);
    }


    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_LGPD_QUEUE)
    public void handleUserDeleted(UserDeletedEvent event) {
        log.info("Received UserDeletedEvent for user [{}]. Purging notification logs and device tokens under LGPD Art. 18",
                event.getUserId());
        notificationLogRepository.deleteByUserId(event.getUserId());
        userDeviceTokenRepository.deleteByUserId(event.getUserId());
        log.info("Successfully scrubbed notification logs and device tokens for user [{}]", event.getUserId());
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    private boolean isDeliverableRecipient(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        String lower = email.trim().toLowerCase();
        int atIndex = lower.indexOf('@');
        if (atIndex <= 0) {
            return false;
        }
        String localPart = lower.substring(0, atIndex);
        String domain = lower.substring(atIndex + 1);

        if (localPart.startsWith("student.")
                || localPart.startsWith("test.")
                || localPart.startsWith("eval.")
                || localPart.startsWith("fresh.")
                || localPart.startsWith("burst.")
                || localPart.startsWith("gamification.")
                || localPart.startsWith("k6.")) {
            return false;
        }

        return !domain.equals("simulado.enem.br")
                && !domain.equals("escola.gov.br")
                && !domain.equals("escola.sp.gov.br")
                && !domain.equals("aprovaenem.com.br")
                && !domain.equals("aprovaenem.local")
                && !domain.equals("enem.br")
                && !domain.equals("example.com")
                && !domain.equals("example.org")
                && !domain.equals("example.net")
                && !domain.equals("test.com")
                && !domain.equals("mailinator.com")
                && !domain.endsWith(".local")
                && !domain.endsWith(".test")
                && !domain.endsWith(".example")
                && !domain.endsWith(".invalid")
                && !domain.endsWith(".localhost");
    }
}
