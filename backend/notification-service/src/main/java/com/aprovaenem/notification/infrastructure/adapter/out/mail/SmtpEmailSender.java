package com.aprovaenem.notification.infrastructure.adapter.out.mail;

import com.aprovaenem.notification.application.port.out.EmailDeliveryException;
import com.aprovaenem.notification.application.port.out.EmailSenderPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/**
 * SMTP implementation of {@link EmailSenderPort} backed by Spring's {@link JavaMailSender}.
 * The SMTP endpoint is configured through {@code spring.mail.*} (Mailpit in local/evaluation environments).
 */
@Slf4j
@Component
public class SmtpEmailSender implements EmailSenderPort {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public SmtpEmailSender(JavaMailSender mailSender, @Value("${app.mail.from}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
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
            throw new EmailDeliveryException("Failed to deliver email to the SMTP server", e);
        }
    }
}
