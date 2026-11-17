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

        {/* Featured Property Listing */}
        <ListingCard />

        {/* Test SponsorBanner */}
        <SponsorBanner
          propertyId="de2fb99f-7791-4391-a755-4a2bc6ca934f"
          targetZip="90000"
        />
      </div>
    </main>
  );
}
