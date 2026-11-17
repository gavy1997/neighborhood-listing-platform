import ListingCard from '@/components/ListingCard'
import SponsorBanner from '@/components/SponsorBanner'

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold">BarrioList Dashboard</h1>

        {/* Render your ListingCard containing the Lab 7 media pipeline asset */}
        <ListingCard />

        {/* Test SponsorBanner */}
        <SponsorBanner
          propertyId="de2fb99f-7791-4391-a755-4a2bc6ca934f"
          targetZip="90000"
        />
      </div>
    </main>
  )
}