package com.aprovaenem.exam.domain.model;

import java.util.UUID;

public class QuestionFilterCommand {

    private UUID topicId;
    private String discipline;
    private DifficultyLevel difficulty;
    public static final int MAX_PAGE_SIZE = 50;
    public static final int DEFAULT_PAGE_SIZE = 20;

    private String search;
    private QuestionStatus status;
    private int page = 0;
    private int size = DEFAULT_PAGE_SIZE;

    public QuestionFilterCommand() {
    }

    public QuestionFilterCommand(UUID topicId, String discipline, DifficultyLevel difficulty, String search, QuestionStatus status, int page, int size) {
        this.topicId = topicId;
        this.discipline = discipline;
        this.difficulty = difficulty;
        this.search = search;
        this.status = status;
        this.page = Math.max(0, page);
        this.size = clampSize(size);
    }

    public UUID getTopicId() {
        return topicId;
    }

    public void setTopicId(UUID topicId) {
        this.topicId = topicId;
    }

    public String getDiscipline() {
        return discipline;
    }

    public void setDiscipline(String discipline) {
        this.discipline = discipline;
    }

    public DifficultyLevel getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(DifficultyLevel difficulty) {
        this.difficulty = difficulty;
    }

    public String getSearch() {
        return search;
    }

    public void setSearch(String search) {
        this.search = search;
    }

    public QuestionStatus getStatus() {
        return status;
    }

    public void setStatus(QuestionStatus status) {
        this.status = status;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = Math.max(0, page);
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = clampSize(size);
    }

    private static int clampSize(int size) {
        if (size <= 0) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(size, MAX_PAGE_SIZE);
    }
}
