import type { Question, QuestionOptionLetter, KnowledgeArea } from '@/types';
import type { QuestionItemDto } from '@/api/types';

/**
 * Maps a backend DTO QuestionItemDto to the frontend domain Question model.
 */
export function mapDtoToDomainQuestion(dto: QuestionItemDto): Question {
  return {
    id: dto.id,
    externalId: dto.externalId || String(dto.itemNumber || ''),
    examYear: dto.year,
    knowledgeArea: (dto.subject || dto.knowledgeArea) as KnowledgeArea,
    discipline: dto.discipline || '',
    difficulty: dto.difficulty,
    statement: dto.statement,
    contextText: dto.contextText,
    imageUrl: dto.figureUrl,
    options: dto.options.map((opt) => ({
      letter: opt.optionLetter as QuestionOptionLetter,
      text: opt.text,
    })),
  };
}
