import Image from 'next/image';

export default function ListingCard() {
  return (
    <article className="rounded-lg shadow-md overflow-hidden bg-white border">
      {/* Property Listing Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src="/asset/optimized/aster-logo-1x1.webp"
          alt="Featured neighborhood listing property"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Listing Content & Lab 7 Sponsor Details */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Neighborhood Listing</h3>
          <p className="text-sm text-gray-500">Local Real Estate & Community Hub</p>
        </div>

        {/* Sponsor Badge Section */}
        <div className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white flex-shrink-0 border">
            <Image
              src="/asset/optimized/aster-logo-1x1.webp"
              alt="Aster Corp corporate logo featuring stylized planetary ring mark"
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900">Aster Corp</h4>
            <p className="text-xs text-gray-600">10% off workshop registration</p>
          </div>
        </div>
      </div>
    </article>
  );
}
