export type SponsorTier = 'Platinum' | 'Gold' | 'Silver'

export interface SponsorCandidate {
  id: string
  name: string
  approved: boolean
  active: boolean
  placement: string
  startDate: string
  endDate: string
  zipCodes: string[]
  coverageRadiusMiles: number
  tier: SponsorTier
  distanceMiles: number
  impressions: number
  destinationUrl: string
}

export interface MatchingContext {
  placement: string
  zipCode: string
  currentDate: string
}

export const HOUSE_FALLBACK_SPONSOR = {
  id: 'house-fallback',
  name: 'Community Open Source Initiative',
  destinationUrl: 'https://example.com/community',
  disclosure: 'Local Partner',
}

const TIER_RANK: Record<SponsorTier, number> = {
  Platinum: 3,
  Gold: 2,
  Silver: 1,
}

const ZIP_PATTERN = /^[0-9]{5}(-[0-9]{4})?$/

function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function compareIds(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

export function selectSponsor(
  context: MatchingContext,
  candidates: SponsorCandidate[],
): SponsorCandidate | null {
  if (
    !context ||
    !ZIP_PATTERN.test(context.zipCode) ||
    !isValidDateOnly(context.currentDate)
  ) {
    return null
  }

  const eligible = candidates.filter((candidate) => {
    if (!candidate || candidate.approved !== true || candidate.active !== true) {
      return false
    }
    if (candidate.placement !== context.placement) return false
    if (!isValidDateOnly(candidate.startDate)) return false
    if (!isValidDateOnly(candidate.endDate)) return false
    if (candidate.startDate > candidate.endDate) return false
    if (
      context.currentDate < candidate.startDate ||
      context.currentDate > candidate.endDate
    ) {
      return false
    }
    if (!Object.hasOwn(TIER_RANK, candidate.tier)) return false
    if (!Array.isArray(candidate.zipCodes)) return false
    if (
      !Number.isFinite(candidate.distanceMiles) ||
      candidate.distanceMiles < 0 ||
      !Number.isFinite(candidate.coverageRadiusMiles) ||
      candidate.coverageRadiusMiles < 0 ||
      !Number.isFinite(candidate.impressions) ||
      candidate.impressions < 0
    ) {
      return false
    }

    const exactZipMatch = candidate.zipCodes.includes(context.zipCode)
    const radiusMatch =
      candidate.distanceMiles <= candidate.coverageRadiusMiles

    return exactZipMatch || radiusMatch
  })

  eligible.sort(
    (a, b) =>
      TIER_RANK[b.tier] - TIER_RANK[a.tier] ||
      a.distanceMiles - b.distanceMiles ||
      a.impressions - b.impressions ||
      compareIds(a.id, b.id),
  )

  return eligible[0] ?? null
}