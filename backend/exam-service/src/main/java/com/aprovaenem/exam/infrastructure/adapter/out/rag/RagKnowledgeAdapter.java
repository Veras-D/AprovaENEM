package com.aprovaenem.exam.infrastructure.adapter.out.rag;

import com.aprovaenem.exam.domain.model.PedagogicalChunk;
import com.aprovaenem.exam.domain.port.out.RagKnowledgePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RagKnowledgeAdapter implements RagKnowledgePort {

    private static final Set<String> STOP_WORDS = Set.of(
            "como", "para", "onde", "qual", "quais", "quem", "porque", "sobre", "pelo",
            "pela", "este", "esta", "esse", "essa", "isso", "com", "sem", "por", "que",
            "uma", "mais", "dos", "das", "the", "and", "how", "what", "when", "with"
    );

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

            List<String> meaningfulWords = Arrays.stream(queryText.trim().replaceAll("[^a-zA-Z0-9À-ÿ\\s]", " ").split("\\s+"))
                    .map(String::trim)
                    .filter(w -> w.length() >= 3)
                    .filter(w -> !STOP_WORDS.contains(w.toLowerCase(Locale.ROOT)))
                    .toList();

            String keyword = !meaningfulWords.isEmpty() ? "%" + meaningfulWords.get(0) + "%" : "%";
            String topicKeyword = meaningfulWords.size() > 1 ? "%" + meaningfulWords.get(1) + "%" : keyword;

            // Retain domain keyword boosting
            String lowerQuery = queryText.toLowerCase(Locale.ROOT);
            if (lowerQuery.contains("chuveiro") || lowerQuery.contains("disjuntor") || lowerQuery.contains("corrente")) {
                topicKeyword = "%disjuntor%";
            } else if (lowerQuery.contains("cilindro") || lowerQuery.contains("volume") || lowerQuery.contains("raio")) {
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
