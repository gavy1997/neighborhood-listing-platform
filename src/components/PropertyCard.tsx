import React from 'react';
import Image from 'next/image';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    imageUrl?: string;
    price?: number;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      {property.imageUrl && (
        <div className="relative w-full h-48 mb-2">
          <Image 
            src={property.imageUrl} 
            alt={property.title} 
            fill 
            className="object-cover rounded-md" 
          />
        </div>
      )}
      <h3 className="font-bold text-lg">{property.title}</h3>
      {property.price && <p className="text-gray-600">${property.price}</p>}
    </div>
  );
}

export default PropertyCard;