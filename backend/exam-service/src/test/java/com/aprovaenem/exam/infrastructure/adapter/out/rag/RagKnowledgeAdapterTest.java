package com.aprovaenem.exam.infrastructure.adapter.out.rag;

import com.aprovaenem.exam.domain.model.PedagogicalChunk;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("RagKnowledgeAdapter Unit Tests")
class RagKnowledgeAdapterTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    private RagKnowledgeAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new RagKnowledgeAdapter(jdbcTemplate);
    }

    @Test
    @DisplayName("Should return empty list for null or blank queryText")
    void shouldReturnEmptyForBlankQuery() {
        assertThat(adapter.findRelevantChunks(null, 3)).isEmpty();
        assertThat(adapter.findRelevantChunks("   ", 3)).isEmpty();
    }

    @Test
    @DisplayName("Should query jdbcTemplate and return relevant pedagogical chunks")
    void shouldQueryChunks() {
        UUID chunkId = UUID.randomUUID();
        PedagogicalChunk chunk = new PedagogicalChunk(chunkId, "Chuveiro elétrico potência P = V * I", 0.88);

        when(jdbcTemplate.query(anyString(), any(RowMapper.class), anyString(), anyString(), anyInt()))
                .thenReturn(List.of(chunk));

        List<PedagogicalChunk> results = adapter.findRelevantChunks("Como funciona o disjuntor do chuveiro?", 3);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getContent()).contains("Chuveiro elétrico");
    }

    @Test
    @DisplayName("Should handle database exception gracefully")
    void shouldHandleExceptionGracefully() {
        when(jdbcTemplate.query(anyString(), any(RowMapper.class), anyString(), anyString(), anyInt()))
                .thenThrow(new DataAccessException("Connection failed") {});

        List<PedagogicalChunk> results = adapter.findRelevantChunks("Cilindro volume raio", 3);
        assertThat(results).isEmpty();
    }
}
