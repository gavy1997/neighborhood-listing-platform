import { SearchFilters } from '../components/SearchFilters';
import SponsorBanner from '../components/SponsorBanner';
import { PropertyCard } from '../components/PropertyCard';

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms?: number;
  imageUrl?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  tagline?: string;
  url?: string;
}

const sampleProperties: Property[] = [
  {
    id: 'prop-101',
    title: 'Modern Downtown Loft',
    address: '123 Main St, Suite 4B, Cityville',
    price: 2400,
    bedrooms: 2,
  },
];

const sampleSponsors: Sponsor[] = [];

export default function HomePage() {
  return (
    <main>
      <h1>Property Listings</h1>
      <SearchFilters />
      <SponsorBanner propertyId="prop-101" targetZip="90001" />
      <div>
        {sampleProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </main>
  );
}