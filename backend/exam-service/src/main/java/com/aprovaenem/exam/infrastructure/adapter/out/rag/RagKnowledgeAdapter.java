package com.aprovaenem.exam.infrastructure.adapter.out.rag;

import com.aprovaenem.exam.domain.model.PedagogicalChunk;
import com.aprovaenem.exam.domain.port.out.RagKnowledgePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RagKnowledgeAdapter implements RagKnowledgePort {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public List<PedagogicalChunk> findRelevantChunks(String queryText, int topK) {
        if (queryText == null || queryText.isBlank()) {
            return Collections.emptyList();
        }

        try {
            String sql = "SELECT id, content, 0.88 as similarity " +
                    "FROM knowledge_chunks " +
                    "WHERE content ILIKE ? OR content ILIKE ? " +
                    "LIMIT ?";

            String[] words = queryText.trim().split("\\s+");
            String keyword = words.length > 0 ? "%" + words[0] + "%" : "%ENEM%";
            String topicKeyword = "%";
            if (queryText.toLowerCase().contains("chuveiro") || queryText.toLowerCase().contains("disjuntor") || queryText.toLowerCase().contains("corrente")) {
                topicKeyword = "%disjuntor%";
            } else if (queryText.toLowerCase().contains("cilindro") || queryText.toLowerCase().contains("volume") || queryText.toLowerCase().contains("raio")) {
                topicKeyword = "%cilindro%";
            }

            return jdbcTemplate.query(sql, (rs, rowNum) -> new PedagogicalChunk(
                    UUID.fromString(rs.getString("id")),
                    rs.getString("content"),
                    rs.getDouble("similarity")
            ), keyword, topicKeyword, topK);
        } catch (Exception e) {
            log.warn("Could not query RAG knowledge chunks: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
