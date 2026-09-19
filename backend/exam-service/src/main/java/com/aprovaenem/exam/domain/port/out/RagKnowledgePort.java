package com.aprovaenem.exam.domain.port.out;

import com.aprovaenem.exam.domain.model.PedagogicalChunk;

import java.util.List;

public interface RagKnowledgePort {

    List<PedagogicalChunk> findRelevantChunks(String queryText, int topK);
}
