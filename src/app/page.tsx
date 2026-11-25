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

const sampleProperties: Property[] = [
  {
    id: 'prop-101',
    title: 'Modern Downtown Loft',
    address: '123 Main St, Suite 4B, Cityville',
    price: 2400,
    bedrooms: 2,
  },
];

export default function HomePage() {
  return (
    <main>
      <h1>Property Listings</h1>
      <SearchFilters />
      {sampleProperties.map((property) => (
        <div key={property.id}>
          <PropertyCard property={property} />
          <SponsorBanner propertyId={property.id} targetZip="90001" />
        </div>
      ))}
    </main>
  );
}
