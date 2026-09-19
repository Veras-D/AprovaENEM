package com.aprovaenem.exam.infrastructure.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionListResponse {

    private List<QuestionSummaryDto> items;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
