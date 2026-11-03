import React from 'react';

export interface ServiceCardProps {
  id: string;
  title: string;
  hourlyRate: number;
  durationMinutes: number;
  coverageRadiusMiles: number;
  onBook?: (serviceId: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  title,
  hourlyRate,
  durationMinutes,
  coverageRadiusMiles,
  onBook,
}) => {
  return (
    <article className="flex flex-col justify-between h-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900">
      <div>
        <header className="mb-4">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">
            ${hourlyRate.toFixed(2)} <span className="text-xs text-slate-500 font-normal">/ hour</span>
          </p>
        </header>

        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-6" aria-label="Service Specifications">
          <li className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Duration:</span>
            <span>{durationMinutes} mins</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Service Area:</span>
            <span>Within {coverageRadiusMiles} miles</span>
          </li>
        </ul>
      </div>

      <div>
        <button
          type="button"
          onClick={() => onBook?.(id)}
          aria-label={`Book appointment for ${title}`}
          className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 active:bg-indigo-700 transition-colors"
        >
          Book Now
        </button>
      </div>
    </article>
  );
};

// Example Container Component demonstrating required responsive Tailwind Grid
export const ServiceGrid: React.FC<{ services: ServiceCardProps[] }> = ({ services }) => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Local Services</h2>
      {/* 1 column on mobile, 2 columns on tablet (md), 3 columns on desktop (lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.id} {...service} />
        ))}
      </div>
    </section>
  );
};