import React from 'react';

export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  imageUrl: string;
}

interface PropertyCardProps {
  property: Property;
  onFavoriteToggle?: (id: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onFavoriteToggle }) => {
  return (
    <article className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
      <img
        src={property.imageUrl}
        alt={`Property listing at ${property.address}, ${property.city}`}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {property.title}
        </h3>

        <p className="text-sm text-gray-500">{property.address}, {property.city}</p>
        <p className="mt-2 text-xl font-bold text-gray-900">${property.price.toLocaleString()}</p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onFavoriteToggle) onFavoriteToggle(property.id);
          }}
          aria-label={`Save ${property.title} to favorites`}
          className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Favorite
        </button>
      </div>
    </article>
  );
};


export default function PropertyCard({ property }) {
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
      
      {/* Rest of your card content */}
    </article>
  );
}
