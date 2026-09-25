import { Property, Sponsor } from '../types';
import { SearchFilters } from '../components/SearchFilters';
import { SponsorBanner } from '../components/SponsorBanner';
import { PropertyCard } from '../components/PropertyCard';

const sampleProperties: Property[] = [
  {
    id: 'prop-101',
    title: 'Modern Downtown Loft',
    address: '123 Main St, Suite 4B, Cityville',
    price: 2400,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1100,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500',
    imageAlt: 'Bright living room with floor-to-ceiling windows'
  },
  {
    id: 'prop-102',
    title: 'Suburban Family Home',
    address: '456 Oak Lane, Pleasantville',
    price: 3100,
    bedrooms: 4,
    bathrooms: 2.5,
    squareFeet: 2400,
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500',
    imageAlt: 'Front exterior of a classic two-story suburban house'
  },
  {
    id: 'prop-103',
    title: 'Cozy Beachside Condo',
    address: '789 Ocean Blvd, Apt 12, Seaside',
    price: 1950,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 750,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500',
    imageAlt: 'Modern white villa adjacent to a swimming pool'
  }
];

const sampleSponsor: Sponsor = {
  name: 'Apex Home Insurance',
  description: 'Protecting your rental investments with low rates.',
  link: '#'
};

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-extrabold mb-6">Property Listings</h1>

      <SearchFilters />
      <SponsorBanner sponsor={sampleSponsor} />

      <section aria-labelledby="listings-heading">
        <h2 id="listings-heading" className="sr-only">Available Properties</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>
    </main>
  );
}