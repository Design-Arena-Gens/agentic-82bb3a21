import { describe, expect, it } from 'vitest';
import { categorizeText, isBiosimilarRelevant } from '@/lib/categorize';

describe('biosimilar relevance detection', () => {
  it('flags content containing biosimilar keyword', () => {
    const result = isBiosimilarRelevant('This announcement highlights a new oncology biosimilar.');
    expect(result.matched).toBe(true);
    expect(result.signals).toContain('biosimilar');
  });

  it('detects reference molecule names for biosimilars', () => {
    const result = isBiosimilarRelevant('Positive phase 3 data for denosumab candidate.');
    expect(result.matched).toBe(true);
    expect(result.signals).toContain('denosumab');
  });
});

describe('categorization logic', () => {
  it('categorizes regulatory approval announcements as critical priority', () => {
    const text =
      'Pfizer receives FDA approval for an interchangeable adalimumab biosimilar with market launch planned.';
    const result = categorizeText(text);
    const categoryIds = result.matchedCategories.map((category) => category.id);

    expect(result.biosimilarMatched).toBe(true);
    expect(categoryIds).toContain('regulatory-approvals');
    expect(result.priority).toBe('critical');
  });

  it('captures launch updates and assigns elevated priority', () => {
    const text = 'Amgen launches new biosimilar in Europe with expanded commercial distribution.';
    const result = categorizeText(text);
    const categoryIds = result.matchedCategories.map((category) => category.id);

    expect(result.biosimilarMatched).toBe(true);
    expect(categoryIds).toContain('commercial-launch');
    expect(result.priority).toBe('elevated');
  });
});
