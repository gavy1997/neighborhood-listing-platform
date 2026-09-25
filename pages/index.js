import { useCallback, useEffect, useState } from 'react'
import Button from '../components/Button'
import ClickCount from '../components/ClickCount'
import styles from '../styles/home.module.css'

function throwError() {
  console.log(
    // The function body() is not defined
    document.body()
  )
}

function Home() {// Requirement 2 feature edit
  const [count, setCount] = useState(0)
  const increment = useCallback(() => {
    setCount((v) => v + 1)
  }, [setCount])

  useEffect(() => {
    const r = setInterval(() => {
      increment()
    }, 1000)

    return () => {
      clearInterval(r)
    }
  }, [increment])

  return (
    <main className={styles.main}>
      <h1>Fast Refresh Demo</h1>
      <p>
        Fast Refresh is a Next.js feature that gives you instantaneous feedback
        on edits made to your React components, without ever losing component
        state.
      </p>
      <hr className={styles.hr} />
      <div>
        <p>
          Auto incrementing value. The counter won't reset after edits or if
          there are errors.
        </p>
        <p>Current value: {count}</p>
      </div>
      <hr className={styles.hr} />
      <div>
        <p>Component with state.</p>
        <ClickCount />
      </div>
      <hr className={styles.hr} />
      <div>
        <p>
          The button below will throw 2 errors. You'll see the error overlay to
          let you know about the errors but it won't break the page or reset
          your state.
        </p>
        <Button
          onClick={(e) => {
            setTimeout(() => document.parentNode(), 0)
            throwError()
          }}
        >
          Throw an Error
        </Button>
      </div>
      <hr className={styles.hr} />
    </main>
  )
}

export default Home
import { SearchFilters } from '../components/SearchFilters';
import { SponsorBanner } from '../components/SponsorBanner';
import { PropertyCard } from '../components/PropertyCard';

const sampleProperties = [
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
    imageAlt: 'Two-story suburban house with green front lawn'
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
    imageAlt: 'Open plan studio apartment with balcony view'
  }
];

const sampleSponsor = {
  id: 'spon-01',
  businessName: 'Apex Home Insurance',
  tagline: 'Protecting your rental investments with low rates.',
  linkUrl: 'https://example.com'
};

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-extrabold mb-6">Property Listings</h1>
      
      <SearchFilters />
      <SponsorBanner sponsor={sampleSponsor} />

      <section aria-labelledby="listings-heading">
        <h2 id="listings-heading" className="sr-only">Available Properties</h2>
        
        {/* Tailwind Grid: 1 col on small, 2 on medium, 3 on large */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>
    </main>
  );
}