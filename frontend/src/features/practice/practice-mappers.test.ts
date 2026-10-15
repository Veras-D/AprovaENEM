import { describe, it, expect } from 'vitest';
import { mapDtoToDomainQuestion } from './practice-mappers';
import type { QuestionItemDto } from '@/api/types';

describe('mapDtoToDomainQuestion', () => {
  it('should accurately map QuestionItemDto to domain Question', () => {
    const dto: QuestionItemDto = {
      id: 'dto-id-123',
      externalId: 'ext-456',
      itemNumber: 456,
      year: 2023,
      subject: 'CN',
      discipline: 'Física',
      difficulty: 'HARD',
      status: 'ACTIVE',
      statement: 'Considere um circuito elétrico...',
      contextText: 'Texto base de contexto...',
      figureUrl: 'https://cdn.exemplo.com/figura.webp',
      options: [
        { id: '1', optionLetter: 'A', text: '10 W' },
        { id: '2', optionLetter: 'B', text: '20 W' },
      ],
    };

    const domain = mapDtoToDomainQuestion(dto);

    expect(domain.id).toBe('dto-id-123');
    expect(domain.externalId).toBe('ext-456');
    expect(domain.examYear).toBe(2023);
    expect(domain.knowledgeArea).toBe('CN');
    expect(domain.discipline).toBe('Física');
    expect(domain.difficulty).toBe('HARD');
    expect(domain.statement).toBe('Considere um circuito elétrico...');
    expect(domain.contextText).toBe('Texto base de contexto...');
    expect(domain.imageUrl).toBe('https://cdn.exemplo.com/figura.webp');
    expect(domain.options).toEqual([
      { letter: 'A', text: '10 W' },
      { letter: 'B', text: '20 W' },
    ]);
  });

  it('should fallback to itemNumber if externalId is empty and knowledgeArea if subject is empty', () => {
    const dto: QuestionItemDto = {
      id: 'dto-fallback',
      itemNumber: 789,
      year: 2021,
      subject: '',
      knowledgeArea: 'MT',
      discipline: '',
      difficulty: 'EASY',
      status: 'ACTIVE',
      statement: 'Calcule a área...',
      options: [],
    };

    const domain = mapDtoToDomainQuestion(dto);
    expect(domain.externalId).toBe('789');
    expect(domain.knowledgeArea).toBe('MT');
    expect(domain.discipline).toBe('');
    expect(domain.options).toEqual([]);
  });
});
