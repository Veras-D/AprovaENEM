package com.aprovaenem.notification.infrastructure.adapter.out.mail;

import com.aprovaenem.notification.application.port.out.EmailDeliveryException;
import com.aprovaenem.notification.application.port.out.EmailSenderPort;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;

/**
 * SMTP implementation of {@link EmailSenderPort} backed by Spring's {@link JavaMailSender}.
 * Can be configured with any standard SMTP relay (e.g. Gmail, SES, SendGrid) or local Mailpit.
 */
@Slf4j
@Component
public class SmtpEmailSender implements EmailSenderPort {

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String fromName;

    public SmtpEmailSender(
            JavaMailSender mailSender,
            @Value("${app.mail.from:no-reply@aprovaenem.local}") String fromAddress,
            @Value("${app.mail.from-name:AprovaENEM}") String fromName
    ) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.fromName = fromName;
    }

    public SmtpEmailSender(JavaMailSender mailSender, String fromAddress) {
        this(mailSender, fromAddress, "AprovaENEM");
    }

    @Override
    public void send(String to, String subject, String textBody) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(textBody);
        try {
            mailSender.send(message);
        } catch (MailException e) {
            throw new EmailDeliveryException("Failed to deliver plain-text email to the SMTP server", e);
        }
    }

    @Override
    public void sendHtml(String to, String subject, String htmlBody, String textFallback) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            if (htmlBody != null && !htmlBody.isBlank()) {
                helper.setText(textFallback != null ? textFallback : "", htmlBody);
            } else {
                helper.setText(textFallback != null ? textFallback : "", false);
            }
            mailSender.send(message);
        } catch (MailException | MessagingException | UnsupportedEncodingException e) {
            throw new EmailDeliveryException("Failed to deliver HTML email to the SMTP server", e);
        }
    }
}
