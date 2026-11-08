export interface Service {
  id: string
  title: string
  hourly_rate: number
  duration_minutes: number
  coverage_radius_miles: number
}

interface ServiceCardProps {
  service: Service
  onBook: (service: Service) => void
}

export default function ServiceCard({ service, onBook }: ServiceCardProps) {
  const titleId = `service-title-${service.id}`

  return (
    <article className="service-card" aria-labelledby={titleId}>
      <header className="service-card__body">
        <h2 id={titleId}>{service.title}</h2>
      </header>

      <ul className="service-card__details">
        <li>
          <strong>Hourly rate:</strong> ${service.hourly_rate.toFixed(2)}
        </li>
        <li>
          <strong>Duration:</strong> {service.duration_minutes} minutes
        </li>
        <li>
          <strong>Coverage radius:</strong> {service.coverage_radius_miles} miles
        </li>
      </ul>

      <button
        type="button"
        className="service-card__button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        aria-label={`Request a booking for ${service.title}`}
        onClick={() => onBook(service)}
      >
        Request a booking
      </button>
    </article>
  )
}