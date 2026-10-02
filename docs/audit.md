# Property-Card Component Architecture Audit

## 1. Semantic Root & Headings
* **Code Snippet:**
  ```tsx
  export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onFavoriteToggle }) => {
    return (
      <article className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition focus-within:ring-2 focus-within:ring-blue-500">
        <img
          src={property.imageUrl}
          <img
  src={property.imageUrl}
  alt={`Property listing at ${property.address}, ${property.city}`}
  className="w-full h-48 object-cover"
/>
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
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <PropertyCard property="{property}"/>
</div>