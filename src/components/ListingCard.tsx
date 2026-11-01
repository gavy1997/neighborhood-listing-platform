import Image from 'next/image';

export default function ListingCard() {
  return (
    <article className="rounded-lg shadow-md overflow-hidden bg-white">
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow">
        <Image
          src="https://gavy1997-project-a-aster.supabase.co/storage/v1/object/public/listings/IMG_1337.jpeg"
          alt="Front exterior view of a split-level suburban home with light siding, double garage doors, walkway, and paved driveway"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
          priority={true}
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900">Suburban Split-Level Home</h3>
        <p className="text-gray-600 text-sm mt-1">Piñon Hills, CA</p>
      </div>
    </article>
  );
}