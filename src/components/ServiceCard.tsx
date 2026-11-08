export interface Service {
  id: string
  title: string
  description: string
  neighborhood: string
  coverage_radius_miles: number
  price: number
}

interface ServiceCardProps {
  service: Service
  onBook: (service: Service) => void
}

export default function ServiceCard({ service, onBook }: ServiceCardProps) {
  const titleId = `service-title-${service.id}`

  return (
    <article className="service-card" aria-labelledby={titleId}>
      <div className="service-card__body">
        <h2 id={titleId}>{service.title}</h2>
        <p>{service.description}</p>

        <dl className="service-card__details">
          <div>
            <dt>Neighborhood</dt>
            <dd>{service.neighborhood}</dd>
          </div>
          <div>
            <dt>Coverage radius</dt>
            <dd>{service.coverage_radius_miles} miles</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>${service.price.toLocaleString()}</dd>
          </div>
        </dl>

        <button
          type="button"
          className="service-card__button"
          aria-label={`Request a booking for ${service.title}`}
          onClick={() => onBook(service)}
        >
          Request a booking
        </button>
      </div>
    </article>
  )
}