import { selectSponsor, SponsorCandidate, MatchingContext, HOUSE_FALLBACK_SPONSOR } from '../lib/sponsorMatcher';

describe('Contextual Sponsor Matching Engine', () => {
  const mockContext: MatchingContext = {
    placement: 'sidebar',
    zipCode: '90210',
    currentDate: '2026-06-01T12:00:00Z',
  };

  const baseCandidate: SponsorCandidate = {
    id: 'sponsor-1',
    name: 'Neighborhood Cafe',
    approved: true,
    active: true,
    placement: 'sidebar',
    startDate: '2026-05-01T00:00:00Z',
    endDate: '2026-07-01T00:00:00Z',
    zipCodes: ['90210', '90211'],
    priority: 1,
    destinationUrl: 'https://example.com/cafe',
  };

  test('selects exact ZIP match successfully', () => {
    const result = selectSponsor(mockContext, [baseCandidate]);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('sponsor-1');
  });

  test('rejects inactive sponsor', () => {
    const inactiveCandidate = { ...baseCandidate, active: false };
    const result = selectSponsor(mockContext, [inactiveCandidate]);
    expect(result).toBeNull();
  });

  test('rejects expired campaign (outside date range)', () => {
    const expiredCandidate = {
      ...baseCandidate,
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2025-12-31T00:00:00Z',
    };
    const result = selectSponsor(mockContext, [expiredCandidate]);
    expect(result).toBeNull();
  });

  test('resolves ties deterministically using priority then alphabetical ID', () => {
    const candidateA = { ...baseCandidate, id: 'sponsor-b', priority: 5 };
    const candidateB = { ...baseCandidate, id: 'sponsor-a', priority: 5 }; // Same priority, 'sponsor-a' comes first alphabetically

    const result = selectSponsor(mockContext, [candidateA, candidateB]);
    expect(result?.id).toBe('sponsor-a');
  });

  test('returns null when no matching candidate exists', () => {
    const unmatchedCandidate = { ...baseCandidate, zipCodes: ['97201'] };
    const result = selectSponsor(mockContext, [unmatchedCandidate]);
    expect(result).toBeNull();
  });
});
