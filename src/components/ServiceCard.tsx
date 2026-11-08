import React from 'react';

interface ServiceCardProps {
  id: string;
  title: string;
  hourlyRate: number;
  durationMinutes: number;
  coverageRadiusMiles: number;
  onBook: (id: string) => void;
}

export function ServiceCard({
  id,
  title,
  hourlyRate,
  durationMinutes,
  coverageRadiusMiles,
  onBook,
}: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="space-y-1 text-sm text-gray-600 mb-4">
          <p><span className="font-semibold">Rate:</span> ${hourlyRate}/hr</p>
          <p><span className="font-semibold">Duration:</span> {durationMinutes} mins</p>
          <p><span className="font-semibold">Coverage:</span> {coverageRadiusMiles} miles</p>
        </div>
      </div>
      <button
        onClick={() => onBook(id)}
        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Book Now
      </button>
    </div>
  );
}