import { recordSponsorImpression } from '../actions/record-sponsor-impression'
import { getActiveSponsorForProperty } from '../actions/get-sponsor'
import { HOUSE_FALLBACK_SPONSOR } from '../lib/sponsorMatcher'

interface SponsorBannerProps {
  propertyId: string
  targetZip: string
}

export default async function SponsorBanner({
  propertyId,
  targetZip,
}: SponsorBannerProps) {
  const sponsor = await getActiveSponsorForProperty(propertyId, targetZip)

  if (!sponsor) {
    const disclosureId = `house-fallback-disclosure-${propertyId}`

    return (
      <div className="border border-stone-200 rounded-lg p-4 bg-stone-50 shadow-sm">
        <span
          id={disclosureId}
          className="text-xs font-semibold tracking-wider text-stone-500 uppercase"
        >
          {HOUSE_FALLBACK_SPONSOR.disclosure}
        </span>
        <h3 className="text-lg font-medium text-stone-900 mt-1">
          {HOUSE_FALLBACK_SPONSOR.name}
        </h3>
        <p className="mt-2 text-sm text-stone-600">
          Community resources for local neighbors.
        </p>
        <a
          href={HOUSE_FALLBACK_SPONSOR.destinationUrl}
          aria-describedby={disclosureId}
          aria-label={`Learn more about ${HOUSE_FALLBACK_SPONSOR.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block w-full text-center bg-stone-900 text-white text-sm font-medium py-2 rounded hover:bg-stone-800 transition"
        >
          Learn More
        </a>
      </div>
    )
  }

  await recordSponsorImpression({
    sponsorId: sponsor.id,
    placement: 'sidebar',
    pageContext: 'home',
  })

  const disclosureId = `sponsor-disclosure-${sponsor.id}`

  return (
    <div className="border border-stone-200 rounded-lg p-4 bg-stone-50 shadow-sm">
      <span
        id={disclosureId}
        className="text-xs font-semibold tracking-wider text-stone-500 uppercase"
      >
        Sponsored Partner
      </span>
      <h3 className="text-lg font-medium text-stone-900 mt-1">
        {sponsor.business_name}
      </h3>
      <a
        href={`/api/sponsors/redirect?sponsor_id=${encodeURIComponent(sponsor.id)}`}
        aria-describedby={disclosureId}
        aria-label={`Learn more about ${sponsor.business_name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block w-full text-center bg-stone-900 text-white text-sm font-medium py-2 rounded hover:bg-stone-800 transition"
      >
        Learn More
      </a>
    </div>
  )
}