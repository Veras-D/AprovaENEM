package com.aprovaenem.exam.domain.port.out;

import com.aprovaenem.exam.domain.model.PedagogicalChunk;
import com.aprovaenem.exam.domain.model.Question;
import com.aprovaenem.exam.domain.model.TutorChatMessage;

import java.util.List;

public interface TutorAiPort {

    String generateSocraticResponse(
            Question question,
            List<PedagogicalChunk> pedagogicalChunks,
            List<TutorChatMessage> history,
            String studentMessage
    );
}
