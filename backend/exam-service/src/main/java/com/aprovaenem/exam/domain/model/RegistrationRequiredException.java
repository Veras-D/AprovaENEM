package com.aprovaenem.exam.domain.model;

public class RegistrationRequiredException extends RuntimeException {

    public RegistrationRequiredException(String message) {
        super(message);
    }
}
