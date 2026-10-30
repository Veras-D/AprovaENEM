package com.aprovaenem.notification.infrastructure.adapter.out.mail;

import com.aprovaenem.notification.application.port.out.EmailDeliveryException;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("SmtpEmailSender Unit Tests")
class SmtpEmailSenderTest {

    @Mock
    private JavaMailSender mailSender;

    @Test
    @DisplayName("Should hand a correctly addressed plain-text message to the mail sender")
    void shouldSendMessage() {
        SmtpEmailSender sender = new SmtpEmailSender(mailSender, "no-reply@aprovaenem.local");

        sender.send("aluno@enem.com.br", "Assunto", "Corpo");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getFrom()).isEqualTo("no-reply@aprovaenem.local");
        assertThat(sent.getTo()).containsExactly("aluno@enem.com.br");
        assertThat(sent.getSubject()).isEqualTo("Assunto");
        assertThat(sent.getText()).isEqualTo("Corpo");
    }

    @Test
    @DisplayName("Should translate mail failures into EmailDeliveryException")
    void shouldWrapMailFailures() {
        doThrow(new MailSendException("refused")).when(mailSender).send(any(SimpleMailMessage.class));
        SmtpEmailSender sender = new SmtpEmailSender(mailSender, "no-reply@aprovaenem.local");

        assertThatThrownBy(() -> sender.send("aluno@enem.com.br", "Assunto", "Corpo"))
                .isInstanceOf(EmailDeliveryException.class)
                .hasCauseInstanceOf(MailSendException.class);
    }

    @Test
    @DisplayName("Should hand a correctly formatted multipart HTML message to JavaMailSender")
    void shouldSendHtmlMessage() {
        MimeMessage mimeMessage = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        SmtpEmailSender sender = new SmtpEmailSender(mailSender, "no-reply@aprovaenem.local", "AprovaENEM");
        sender.sendHtml("aluno@enem.com.br", "Assunto", "<h1>HTML</h1>", "Texto");

        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Should wrap MIME or send exceptions in EmailDeliveryException when sending HTML")
    void shouldWrapHtmlExceptions() {
        MimeMessage mimeMessage = new MimeMessage((Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new MailSendException("smtp error")).when(mailSender).send(any(MimeMessage.class));

        SmtpEmailSender sender = new SmtpEmailSender(mailSender, "no-reply@aprovaenem.local", "AprovaENEM");

        assertThatThrownBy(() -> sender.sendHtml("aluno@enem.com.br", "Assunto", "<h1>HTML</h1>", "Texto"))
                .isInstanceOf(EmailDeliveryException.class)
                .hasCauseInstanceOf(MailSendException.class);
    }
}
