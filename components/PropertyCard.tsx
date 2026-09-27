import React from 'react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <article className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col h-full">
      <img
        src={property.imageUrl}
        alt={property.imageAlt}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {property.title}
          </h3>
          <p className="text-gray-600 text-sm mb-2">{property.address}</p>
          <p className="text-2xl font-extrabold text-blue-600 mb-4">
            ${property.price.toLocaleString()}<span className="text-sm text-gray-500 font-normal">/mo</span>
          </p>

          <ul className="flex flex-wrap gap-4 text-sm text-gray-700 border-t border-b border-gray-100 py-3 mb-4">
            <li><span className="font-semibold">{property.bedrooms}</span> beds</li>
            <li><span className="font-semibold">{property.bathrooms}</span> baths</li>
            <li><span className="font-semibold">{property.squareFeet.toLocaleString()}</span> sq ft</li>
          </ul>
        </div>

        <a
          href={`/property/${property.id}`}
          className="inline-block text-center bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label={`View details for ${property.title}`}
        >
          View details for {property.title}
        </a>
      </div>
    </article>
  );
};