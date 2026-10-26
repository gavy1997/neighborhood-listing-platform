<<<<<<< HEAD
import { getActiveSponsorForProperty } from '../actions/get-sponsor';
=======
import React from 'react';
import type { Sponsor } from '../../types';

>>>>>>> origin/main
interface SponsorBannerProps {
  propertyId: string;
  targetZip: string;
}

export default async function SponsorBanner({ propertyId, targetZip }: SponsorBannerProps) {
  const sponsor = await getActiveSponsorForProperty(propertyId, targetZip);

  if (!sponsor) {
    return (
      <div className="text-sm text-stone-400 p-4 border border-dashed rounded-lg bg-stone-50">
        Sponsorship slot available
      </div>
    );
  }

  return (
    <div className="border border-stone-200 rounded-lg p-4 bg-stone-50 shadow-sm">
      <span className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
        Sponsored Partner
      </span>
      <h3 className="text-lg font-medium text-stone-900 mt-1">
        {sponsor.company_name}
      </h3>
      <a 
        href={sponsor.destination_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-3 inline-block w-full text-center bg-stone-900 text-white text-sm font-medium py-2 rounded hover:bg-stone-800 transition"
      >
        Learn More
      </a>
    </div>
  );
}