import ListingCard from "@/components/ListingCard";
import SponsorBanner from "@/components/SponsorBanner";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">BarrioList Dashboard</h1>
        
        {/* Render your ListingCard containing the Lab 7 media pipeline asset */}
        <ListingCard />

        {/* Optional Sponsor Banner */}
        <SponsorBanner propertyId="default-prop-id" targetZip="90044" />
      </div>
    </main>
  );
}
