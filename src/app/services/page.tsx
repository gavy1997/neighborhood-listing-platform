'use client';

import React, { useEffect, useState } from 'react';
import { ServiceCard } from '@/components/ServiceCard';

interface Service {
  id: string;
  title: string;
  hourly_rate: number;
  duration_minutes: number;
  coverage_radius_miles: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setServices(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleBook = (serviceId: string) => {
    alert(`Initiating booking for service ID: ${serviceId}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Local Merchant Services
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Browse verified neighborhood service providers and book appointments.
          </p>
        </header>

        {loading ? (
          <p className="text-gray-500">Loading available services...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                hourlyRate={service.hourly_rate}
                durationMinutes={service.duration_minutes}
                coverageRadiusMiles={service.coverage_radius_miles}
                onBook={handleBook}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}