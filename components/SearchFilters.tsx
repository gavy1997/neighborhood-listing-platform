import React from 'react';

export const SearchFilters: React.FC = () => {
  return (
    <section aria-labelledby="search-heading" className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
      <h2 id="search-heading" className="sr-only">Search and Filter Properties</h2>
      <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label htmlFor="location-select" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            id="location-select"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">All Locations</option>
            <option value="cityville">Cityville</option>
            <option value="pleasantville">Pleasantville</option>
            <option value="seaside">Seaside</option>
          </select>
        </div>

        <div>
          <label htmlFor="price-select" className="block text-sm font-medium text-gray-700 mb-1">
            Max Price
          </label>
          <select
            id="price-select"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Any Price</option>
            <option value="2000">$2,000 / mo</option>
            <option value="3000">$3,000 / mo</option>
            <option value="4000">$4,000 / mo</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Apply Filters
        </button>
      </form>
    </section>
  );
};