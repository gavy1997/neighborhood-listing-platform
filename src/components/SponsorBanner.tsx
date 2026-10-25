import React from 'react';
import { Sponsor } from '../types';

interface SponsorBannerProps {
  sponsor: Sponsor;
}

export const SponsorBanner: React.FC<SponsorBannerProps> = ({ sponsor }) => {
  return (
    <aside aria-label="Sponsored Content" className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="bg-amber-200 text-amber-900 text-xs uppercase font-bold px-2 py-1 rounded">
          Sponsored
        </span>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{sponsor.name}</h2>
          <p className="text-sm text-gray-700">{sponsor.description}</p>
        </div>
      </div>
      <a
        href={sponsor.link}
        className="inline-block text-center bg-amber-800 text-white text-sm font-medium py-1.5 px-3 rounded hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 shrink-0"
      >
        Learn More
      </a>
    </aside>
  );
};