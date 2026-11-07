import SponsorBanner from '../components/SponsorBanner';
import ListingCard from '../components/ListingCard';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-100 p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">BarrioList Preview</h1>
          <p className="text-sm text-stone-500 mt-1">Property Listing & Sponsor</p>
        </div>

        {/* Featured Property Listing */}
        <ListingCard />

        {/* Test SponsorBanner with a sample property ID and target ZIP code */}
        <SponsorBanner propertyId="b88eb142-3f8d-4d39-82e3-236bddd600c3" targetZip="90266" />
      </div>
    </main>
  );
}
