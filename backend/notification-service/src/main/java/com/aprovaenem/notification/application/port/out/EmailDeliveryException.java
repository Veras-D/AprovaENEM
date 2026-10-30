package com.aprovaenem.notification.application.port.out;

/**
 * Raised when an email could not be delivered to the configured mail server.
 */
public class EmailDeliveryException extends RuntimeException {

    public EmailDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
