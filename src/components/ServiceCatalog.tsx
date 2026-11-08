'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import ServiceCard, { type Service } from './ServiceCard'

export default function ServiceCatalog() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const bookingHeading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    let active = true

    async function loadServices() {
      try {
        const response = await fetch('/api/services')
        const result = (await response.json()) as {
          data?: Service[]
          error?: string
        }

        if (!response.ok) {
          throw new Error(result.error || 'Could not load services.')
        }

        if (active) setServices(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error ? error.message : 'Could not load services.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadServices()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (selectedService) bookingHeading.current?.focus()
  }, [selectedService])

  function chooseService(service: Service) {
    setSelectedService(service)
    setBookingMessage('')
    setBookingError('')
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedService) return

    setSubmitting(true)
    setBookingError('')
    setBookingMessage('')

    const form = new FormData(event.currentTarget)
    const payload = {
      service_id: selectedService.id,
      client_name: String(form.get('client_name') || ''),
      client_email: String(form.get('client_email') || ''),
      requested_date: String(form.get('requested_date') || ''),
      notes: String(form.get('notes') || ''),
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = (await response.json()) as { message?: string; error?: string }

      if (!response.ok) {
        throw new Error(result.error || 'Could not submit booking request.')
      }

      setBookingMessage(result.message || 'Booking request submitted.')
      setSelectedService(null)
      event.currentTarget.reset()
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : 'Could not submit booking request.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const localToday = new Date()
  localToday.setMinutes(
    localToday.getMinutes() - localToday.getTimezoneOffset(),
  )
  const minDate = localToday.toISOString().slice(0, 10)

  return (
    <section aria-labelledby="services-heading" aria-busy={loading}>
      <h1 id="services-heading">Neighborhood services</h1>
      <p>Find local providers serving your area.</p>

      {loading && <p role="status">Loading services…</p>}
      {loadError && <p role="alert">{loadError}</p>}
      {!loading && !loadError && services.length === 0 && (
        <p>No approved services are available right now.</p>
      )}

      {bookingMessage && <p role="status">{bookingMessage}</p>}

      {services.length > 0 && (
        <div className="service-grid">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={chooseService}
            />
          ))}
        </div>
      )}

      {selectedService && (
        <section className="booking-panel" aria-labelledby="booking-heading">
          <h2 id="booking-heading" ref={bookingHeading} tabIndex={-1}>
            Request a booking: {selectedService.title}
          </h2>

          <form onSubmit={submitBooking}>
            <label htmlFor="client_name">Your name</label>
            <input
              id="client_name"
              name="client_name"
              autoComplete="name"
              maxLength={120}
              required
            />

            <label htmlFor="client_email">Email</label>
            <input
              id="client_email"
              name="client_email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
            />

            <label htmlFor="requested_date">Requested date</label>
            <input
              id="requested_date"
              name="requested_date"
              type="date"
              min={minDate}
              required
            />

            <label htmlFor="notes">What do you need?</label>
            <textarea
              id="notes"
              name="notes"
              minLength={10}
              maxLength={2000}
              required
            />

            {bookingError && <p role="alert">{bookingError}</p>}

            <button type="submit" disabled={submitting}>
              {submitting ? 'Sending request…' : 'Send booking request'}
            </button>
            <button
              type="button"
              onClick={() => setSelectedService(null)}
              disabled={submitting}
            >
              Cancel
            </button>
          </form>
        </section>
      )}
    </section>
  )
}