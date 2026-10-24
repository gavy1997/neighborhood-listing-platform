export interface SponsorCandidate {
  id: string;
  name: string;
  approved: boolean;
  active: boolean;
  placement: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  zipCodes: string[];
  priority: number;
  destinationUrl: string;
}

export interface MatchingContext {
  placement: string;
  zipCode: string;
  currentDate: string; // ISO date string
}

export const HOUSE_FALLBACK_SPONSOR = {
  id: 'house-fallback',
  name: 'Community Open Source Initiative',
  destinationUrl: 'https://example.com/community',
  disclosure: 'Local Partner'
};

/**
 * Pure, deterministic sponsor selection algorithm.
 */
export function selectSponsor(
  context: MatchingContext,
  candidates: SponsorCandidate[]
): SponsorCandidate | null {
  if (!candidates || candidates.length === 0) {
    return null;
  }

  const now = new Date(context.currentDate).getTime();

  // 1. Filter candidates by explicit eligibility rules
  const eligible = candidates.filter((candidate) => {
    if (!candidate.approved || !candidate.active) return false;
    if (candidate.placement !== context.placement) return false;

    const start = new Date(candidate.startDate).getTime();
    const end = new Date(candidate.endDate).getTime();
    if (now < start || now > end) return false;

    if (!candidate.zipCodes.includes(context.zipCode)) return false;

    return true;
  });

  if (eligible.length === 0) {
    return null;
  }

  // 2. Deterministic Tie-Breaker: Priority (descending), then ID (alphabetical)
  eligible.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return a.id.localeCompare(b.id);
  });

  return eligible[0];
}
