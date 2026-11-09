import Image from 'next/image';

export default function SponsorBadge() {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-50 flex-shrink-0">
        <Image
          src="/asset/optimized/aster-logo-1x1.webp"
          alt="Aster Corp corporate logo featuring stylized planetary ring mark"
          fill
          sizes="64px"
          className="object-cover"
          priority
        />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">Aster Corp</h4>
        <p className="text-sm text-gray-600">10% off workshop registration</p>
      </div>
    </div>
  );
}
