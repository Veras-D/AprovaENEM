package com.aprovaenem.notification.infrastructure.adapter.in.messaging;

import com.aprovaenem.common.events.DailyGoalReminderEvent;
import com.aprovaenem.common.events.EmailVerificationRequestedEvent;
import com.aprovaenem.common.events.PasswordResetRequestedEvent;
import com.aprovaenem.common.events.UserDeletedEvent;
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

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_REMINDERS_QUEUE)
    public void handleDailyGoalReminder(DailyGoalReminderEvent event) {
        log.info("Received DailyGoalReminderEvent for user [{}]", event.getUserId());
        Instant now = Instant.now();
        int remaining = Math.max(1, event.getTargetQuestions() - event.getQuestionsCompleted());

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

    private String deliverVerificationEmail(EmailVerificationRequestedEvent event, String name) {
        if (event.getEmail() == null || event.getEmail().isBlank() || event.getVerificationToken() == null) {
            log.warn("Skipping verification email for user [{}]: missing recipient or token", event.getUserId());
            return "FAILED";
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
                .replace("{{NAME}}", name)
                .replace("{{TOKEN}}", token);
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
        String body = "SENT".equals(status)
                ? String.format("Olá %s! Enviamos o código para recuperação da sua senha AprovaENEM. "
                        + "Verifique sua caixa de entrada e informe o código no aplicativo.", name)
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

    private String deliverPasswordResetEmail(PasswordResetRequestedEvent event, String name) {
        if (event.getEmail() == null || event.getEmail().isBlank() || event.getResetToken() == null) {
            log.warn("Skipping password reset email for user [{}]: missing recipient or token", event.getUserId());
            return "FAILED";
        }

        String textFallback = String.format(
                "Olá %s!%n%nRecebemos uma solicitação para redefinir a senha da sua conta no AprovaENEM.%n"
                        + "Informe o seguinte código no aplicativo para cadastrar uma nova senha:%n%n    %s%n%n(Código válido por 24 horas)%n%n"
                        + "Se você não solicitou a redefinição de senha, ignore este e-mail.%n",
                name, event.getResetToken());

        String html = buildPasswordResetHtml(name, event.getResetToken());

        try {
            emailSender.sendHtml(event.getEmail(), "Recuperação de Senha — AprovaENEM", html, textFallback);
            return "SENT";
        } catch (EmailDeliveryException e) {
            log.error("Could not deliver password reset email to [{}]", event.getEmail(), e);
            return "FAILED";
        }
    }

    private String buildPasswordResetHtml(String name, String token) {
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
        Para prosseguir, informe o código de segurança abaixo no aplicativo:
      </p>
      <div style="background-color:#f8fafc;border:2px dashed #cbd5e1;border-radius:12px;padding:24px 20px;text-align:center;margin:28px 0;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:10px;">
          Código de Recuperação de Senha
        </div>
        <div style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:800;color:#0284c7;letter-spacing:10px;">
          {{TOKEN}}
        </div>
      </div>
      <p style="font-size:13px;color:#64748b;margin-bottom:0;text-align:center;">
        ⚠️ Este código de segurança expira em 24 horas. Se você não solicitou esta alteração, ignore este e-mail e sua senha permanecerá inalterada.
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
                .replace("{{NAME}}", name)
                .replace("{{TOKEN}}", token);
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
}
