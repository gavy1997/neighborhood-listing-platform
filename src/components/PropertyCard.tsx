import Image from 'next/image';

interface Property {
  id: string;
  title: string;
  hourly_rate?: number;
  duration_minutes?: number;
  coverage_radius_miles?: number;
  // add other property fields as needed
}

export function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="relative w-full h-48 mb-2">
        <Image 
          src={property.image_url || '/placeholder.jpg'} 
          alt={property.title} 
          fill 
          className="object-cover rounded-md"
        />
      </div>
      <h3 className="font-semibold text-lg">{property.title}</h3>
      {/* Other details */}
    </div>
  );
}

export default PropertyCard;
