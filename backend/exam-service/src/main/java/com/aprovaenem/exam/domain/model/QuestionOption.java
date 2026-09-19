package com.aprovaenem.exam.domain.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class QuestionOption implements Serializable {

    private static final long serialVersionUID = 1L;

    private UUID id;
    private UUID questionId;
    private char optionLetter;
    private String optionText;
    private boolean isCorrect;

    public QuestionOption() {
    }

    public QuestionOption(UUID id, UUID questionId, char optionLetter, String optionText, boolean isCorrect) {
        validateOptionLetter(optionLetter);
        this.id = id;
        this.questionId = questionId;
        this.optionLetter = Character.toUpperCase(optionLetter);
        this.optionText = Objects.requireNonNull(optionText, "Option text cannot be null");
        this.isCorrect = isCorrect;
    }

    private void validateOptionLetter(char letter) {
        char upper = Character.toUpperCase(letter);
        if (upper < 'A' || upper > 'E') {
            throw new IllegalArgumentException("Option letter must be between A and E. Received: " + letter);
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getQuestionId() {
        return questionId;
    }

    public void setQuestionId(UUID questionId) {
        this.questionId = questionId;
    }

    public char getOptionLetter() {
        return optionLetter;
    }

    public void setOptionLetter(char optionLetter) {
        validateOptionLetter(optionLetter);
        this.optionLetter = Character.toUpperCase(optionLetter);
    }

    public String getOptionText() {
        return optionText;
    }

    public void setOptionText(String optionText) {
        this.optionText = Objects.requireNonNull(optionText, "Option text cannot be null");
    }

    public boolean isCorrect() {
        return isCorrect;
    }

    public void setCorrect(boolean correct) {
        isCorrect = correct;
    }
}
