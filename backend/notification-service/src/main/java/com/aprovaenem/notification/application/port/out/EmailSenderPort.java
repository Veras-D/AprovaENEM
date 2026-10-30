package com.aprovaenem.notification.application.port.out;

/**
 * Outbound port for delivering transactional plain-text emails.
 */
public interface EmailSenderPort {

    /**
     * Delivers a plain-text email.
     *
     * @throws EmailDeliveryException when the message could not be handed to the mail server
     */
    void send(String to, String subject, String textBody);

    /**
     * Delivers a multipart/alternative HTML email with plain-text fallback.
     *
     * @throws EmailDeliveryException when the message could not be handed to the mail server
     */
    void sendHtml(String to, String subject, String htmlBody, String textFallback);
}
