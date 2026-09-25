// src/types/index.ts

export interface Property {
  id: string; // Required stable ID for React rendering keys
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  imageUrl: string;
  imageAlt: string; // Required for accessibility
  isFeatured?: boolean; // Explicit optional field example
}

export interface Sponsor {
  id: string;
  businessName: string;
  tagline: string;
  linkUrl: string;
  logoUrl?: string; // Optional field
}