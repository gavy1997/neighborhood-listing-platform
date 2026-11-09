import ListingCard from '@/components/ListingCard'
import SponsorBanner from '@/components/SponsorBanner'

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-100 p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            BarrioList Preview
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Property Listing & Sponsor
          </p>
        </div>

        {/* Render your ListingCard containing the Lab 7 media pipeline asset */}
        <ListingCard />

        <ListingCard propertyId="default-prop-id" targetZip="90044" />
<SponsorBanner propertyId="default-prop-id" targetZip="90044" />
    </main>
  );
}
