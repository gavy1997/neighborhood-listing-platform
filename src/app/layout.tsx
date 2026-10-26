import type { Metadata } from 'next';
import '../../global.css';

export const metadata: Metadata = {
  title: 'BarrioList',
  description: 'Neighborhood Listing Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}