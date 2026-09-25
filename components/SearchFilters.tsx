import React, { useState } from 'react';

export const SearchFilters: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6 border">
      <h2 className="text-lg font-semibold mb-3">Filter Properties</h2>
      
      {error && (
        <div id="form-error" role="alert" className="text-red-700 bg-red-100 p-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <label htmlFor="property-type" className="text-sm font-medium text-gray-700 mb-1">
            Property Type
          </label>
          <select
            id="property-type"
            name="propertyType"
            className="border rounded p-2 focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <option value="">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="price-range" className="text-sm font-medium text-gray-700 mb-1">
            Max Price
          </label>
          <select
            id="price-range"
            name="priceRange"
            className="border rounded p-2 focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <option value="">Any Price</option>
            <option value="1500">$1,500/mo</option>
            <option value="2500">$2,500/mo</option>
            <option value="3500">$3,500/mo</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
      >
        Apply Filters
      </button>
    </form>
  );
};