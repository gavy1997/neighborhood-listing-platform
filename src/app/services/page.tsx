import ServiceCatalog from '@/components/ServiceCatalog'

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ServiceCatalog />
      </div>
    </main>
  )
}