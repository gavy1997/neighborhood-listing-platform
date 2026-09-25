import React from 'react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <article className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
      <img
        src={property.imageUrl}
        alt={property.imageAlt}
        className="h-48 w-full object-cover"
      />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{property.title}</h3>
        <address className="not-italic text-sm text-gray-600 mb-2">
          {property.address}
        </address>
        <p className="text-lg font-semibold text-emerald-700 mb-3">
          ${property.price.toLocaleString()}/mo
        </p>
        
        <ul className="flex gap-4 text-xs text-gray-500 mb-4 border-t border-b py-2" aria-label="Property details">
          <li><strong>{property.bedrooms}</strong> Beds</li>
          <li><strong>{property.bathrooms}</strong> Baths</li>
          <li><strong>{property.squareFeet}</strong> sq ft</li>
        </ul>

        <a
          href={`/properties/${property.id}`}
          className="mt-auto block text-center bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          aria-label={`View details for ${property.title}`}
        >
          View Details
        </a>
      </div>
    </article>
  );
};