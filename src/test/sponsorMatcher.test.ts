import { describe, expect, test } from 'vitest'
import { selectSponsor } from '../lib/sponsorMatcher'
import type {
  MatchingContext,
  SponsorCandidate,
} from '../lib/sponsorMatcher'

describe('Contextual Sponsor Matching Engine', () => {
  const context: MatchingContext = {
    placement: 'sidebar',
    zipCode: '90032',
    currentDate: '2026-11-17',
  }

  const base: SponsorCandidate = {
    id: 'sponsor-1',
    name: 'Neighborhood Cafe',
    approved: true,
    active: true,
    placement: 'sidebar',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    zipCodes: ['90032'],
    coverageRadiusMiles: 5,
    tier: 'Silver',
    distanceMiles: 1,
    impressions: 10,
    destinationUrl: 'https://example.com/cafe',
  }

  test('selects an exact ZIP match, even outside its radius', () => {
    const candidate = {
      ...base,
      distanceMiles: 25,
      coverageRadiusMiles: 5,
    }
    expect(selectSponsor(context, [candidate])?.id).toBe('sponsor-1')
  })

  test('allows a nearby sponsor at the radius boundary', () => {
    const candidate = {
      ...base,
      zipCodes: [],
      distanceMiles: 5,
      coverageRadiusMiles: 5,
    }
    expect(selectSponsor(context, [candidate])?.id).toBe('sponsor-1')
  })

  test('rejects a nearby sponsor just beyond the radius', () => {
    const candidate = {
      ...base,
      zipCodes: [],
      distanceMiles: 5.0001,
      coverageRadiusMiles: 5,
    }
    expect(selectSponsor(context, [candidate])).toBeNull()
  })

  test('treats both campaign date boundaries as inclusive', () => {
    const startsToday = { ...base, startDate: context.currentDate }
    const endsToday = {
      ...base,
      startDate: '2026-11-01',
      endDate: context.currentDate,
    }
    expect(selectSponsor(context, [startsToday])?.id).toBe('sponsor-1')
    expect(selectSponsor(context, [endsToday])?.id).toBe('sponsor-1')
  })

  test.each(['2026-02-30', '', 'not-a-date'])(
    'rejects malformed campaign dates: %s',
    (date) => {
      const candidate = { ...base, startDate: date }
      expect(selectSponsor(context, [candidate])).toBeNull()
    },
  )

  test('rejects an inverted date range', () => {
    const candidate = {
      ...base,
      startDate: '2026-11-20',
      endDate: '2026-11-10',
    }
    expect(selectSponsor(context, [candidate])).toBeNull()
  })

  test('rejects a pending high-tier sponsor before ranking', () => {
    const pending = {
      ...base,
      id: 'platinum-pending',
      tier: 'Platinum' as const,
      approved: false,
      distanceMiles: 0.1,
    }
    expect(selectSponsor(context, [pending])).toBeNull()
  })

  test('selects Sponsor C from the audit fixture', () => {
    const fixture = [
      { ...base, id: 'A', tier: 'Silver' as const, distanceMiles: 0.4, impressions: 120 },
      { ...base, id: 'B', tier: 'Gold' as const, distanceMiles: 1.2, impressions: 45 },
      { ...base, id: 'C', tier: 'Gold' as const, distanceMiles: 0.8, impressions: 90 },
      {
        ...base,
        id: 'D',
        tier: 'Platinum' as const,
        distanceMiles: 0.2,
        impressions: 10,
        approved: false,
      },
    ]

    expect(selectSponsor(context, fixture)?.id).toBe('C')
  })

  test('selects the same ID regardless of input order', () => {
    const first = { ...base, id: 'sp-b', tier: 'Gold' as const, distanceMiles: 2, impressions: 50 }
    const second = { ...base, id: 'sp-a', tier: 'Gold' as const, distanceMiles: 2, impressions: 50 }
    const candidates = [first, second]

    expect(selectSponsor(context, candidates)?.id).toBe('sp-a')
    expect(selectSponsor(context, [...candidates].reverse())?.id).toBe('sp-a')
  })

  test('uses fewer impressions after tier and distance tie', () => {
    const more = { ...base, id: 'sp-a', tier: 'Gold' as const, distanceMiles: 2, impressions: 50 }
    const fewer = { ...base, id: 'sp-z', tier: 'Gold' as const, distanceMiles: 2, impressions: 40 }

    expect(selectSponsor(context, [more, fewer])?.id).toBe('sp-z')
  })

  test('returns null for an empty candidate list', () => {
    expect(selectSponsor(context, [])).toBeNull()
  })

  test('rejects invalid distance even for an exact ZIP match', () => {
    const candidate = { ...base, distanceMiles: Number.NaN }
    expect(selectSponsor(context, [candidate])).toBeNull()
  })

    test('demonstrates predictable outcomes for three property ZIP contexts', () => {
    const exactZipProperty = { ...context, zipCode: '90032' }
    const nearbyProperty = { ...context, zipCode: '90033' }
    const outOfRangeProperty = { ...context, zipCode: '90034' }

    const exactZipSponsor = {
      ...base,
      id: 'exact-zip-sponsor',
      zipCodes: ['90032'],
      distanceMiles: 25,
    }

    const nearbySponsor = {
      ...base,
      id: 'nearby-sponsor',
      zipCodes: ['90032'],
      distanceMiles: 3,
      coverageRadiusMiles: 5,
    }

    const outOfRangeSponsor = {
      ...base,
      id: 'out-of-range-sponsor',
      zipCodes: ['90032'],
      distanceMiles: 6,
      coverageRadiusMiles: 5,
    }

    expect(selectSponsor(exactZipProperty, [exactZipSponsor])?.id).toBe(
      'exact-zip-sponsor',
    )
    expect(selectSponsor(nearbyProperty, [nearbySponsor])?.id).toBe(
      'nearby-sponsor',
    )
    expect(selectSponsor(outOfRangeProperty, [outOfRangeSponsor])).toBeNull()
  })
})