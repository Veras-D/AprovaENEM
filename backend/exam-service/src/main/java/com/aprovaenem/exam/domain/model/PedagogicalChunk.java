package com.aprovaenem.exam.domain.model;

import java.io.Serializable;
import java.util.UUID;

public class PedagogicalChunk implements Serializable {

    private final UUID id;
    private final String content;
    private final double similarity;

    public PedagogicalChunk(UUID id, String content, double similarity) {
        this.id = id;
        this.content = content;
        this.similarity = similarity;
    }

    public UUID getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public double getSimilarity() {
        return similarity;
    }
}
