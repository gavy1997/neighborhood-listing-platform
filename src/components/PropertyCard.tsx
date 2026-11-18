import Image from 'next/image';

interface Property {
  id: string;
  title: string;
  image_url?: string;
  [key: string]: any;
}

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
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
    </div>
  );
}

export default PropertyCard;
