import React from 'react';
import { Sponsor } from '../types';

interface SponsorBannerProps {
  sponsor: Sponsor;
}

export const SponsorBanner: React.FC<SponsorBannerProps> = ({ sponsor }) => {
  return (
    <aside className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center justify-between mb-6">
      <div>
        <span className="inline-block bg-amber-200 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider mb-1">
          Sponsored
        </span>
        <h2 className="text-lg font-bold text-gray-900">{sponsor.businessName}</h2>
        <p className="text-sm text-gray-700">{sponsor.tagline}</p>
      </div>
      <a
        href={sponsor.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"
        aria-label={`Visit sponsor website for ${sponsor.businessName}`}
      >
        Learn More
      </a>
    </aside>
  );
};