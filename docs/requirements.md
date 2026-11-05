# Local Merchant Services and Appointment Booking Requirements

## Scope and assumptions

This exam slice supports local service providers, neighborhood clients, and platform administrators. A provider-created service starts as a draft and must be approved before public display. Booking requests are accepted, but clients cannot read other clients' bookings.

The exam specifies active service categories and coverage radius, but does not fully define how neighborhood districts or coverage zones are stored. Those details need confirmation before they can be implemented precisely.

## Story 1: Provider submits a service draft

**User story:** As an authenticated service provider, I want to submit a service listing with an hourly rate so that clients can request appointments after an administrator approves it.

**Estimate:** Medium

**Acceptance criteria:**

- **Given** an authenticated provider and a valid service payload, **when** the provider submits the service, **then** the service is saved with `status = 'draft'` and `provider_id` equal to the authenticated user's ID.
- **Given** a service payload with a title shorter than five characters, a negative rate, an invalid duration, or an unknown field, **when** the provider submits it, **then** the API returns HTTP 400 and does not insert the service.

**Traceability:** `supabase/migrations/20261029140000_exam_services_persistence.sql`; `src/schemas/service.ts`; `app/api/services/route.ts`.

## Story 2: Client browses and requests a service

**User story:** As a neighborhood client, I want to browse approved local services and request an appointment without seeing other clients' booking details.

**Estimate:** Large

**Acceptance criteria:**

- **Given** an anonymous visitor, **when** they request the services list, **then** the response includes only services with `status = 'approved'` and only public service fields.
- **Given** a visitor submits a booking request with a valid service, email, date, and notes, **when** the request is accepted, **then** a booking is created.
- **Given** a client requests booking records, **when** they try to read bookings, **then** they cannot see bookings or contact information belonging to other clients.

**Traceability:** `supabase/migrations/20261029140000_exam_services_persistence.sql`; `app/api/services/route.ts`; booking access rules in `docs/security-audit.md`. A dedicated booking route is not listed in the exam's required route files and needs confirmation.

## Story 3: Administrator reviews services and bookings

**User story:** As a platform administrator, I want to approve or suspend services and review bookings so that I can oversee service quality and address misuse.

**Estimate:** Large

**Acceptance criteria:**

- **Given** an authenticated administrator, **when** they approve a draft service, **then** its status changes to `approved` and it becomes available through the public services query.
- **Given** an administrator, **when** they review bookings for a service, **then** they can see bookings associated with that service.
- **Given** a non-admin user, **when** they attempt an administrator action or read another user's booking, **then** the request is denied by server authorization or RLS.

**Traceability:** `supabase/migrations/20261029140000_exam_services_persistence.sql`; administrator and booking policies in `docs/security-audit.md`; server-side route authorization.

## Questions to confirm

1. How are neighborhood districts and active coverage zones represented? The required schema includes `coverage_radius_miles` and active categories but no district or zone table.
2. Should a booking be allowed for an unapproved or suspended service? The requirements imply bookings should be for approved services.
3. Does “admin elevated service execution” mean a server-only service-role client, or a custom admin role checked through `profiles`?

# Product Requirements & Acceptance Criteria (Local Services & Bookings Subsystem)

## User Stories & Traceability Matrix

### Story 1: Service Provider / Merchant Listing Creation
* **Role**: Service Provider / Merchant
* **Goal**: Submit service listing drafts with hourly rates, duration, and coverage radius so clients can book appointments once verified.
* **Scope Estimate**: Medium
* **Traceability Link**: `supabase/migrations/20261029140000_exam_services_persistence.sql` (`services` table) | `app/api/services/route.ts` (`POST`)

#### Acceptance Criteria
* **Given** an authenticated merchant provider,
* **When** submitting a service offering payload with a valid title (>= 5 chars), rate (>= 0), duration (>= 15 mins), and radius (> 0),
* **Then** the record is stored in `services` with `status = 'draft'` and `provider_id = auth.uid()`.

---

### Story 2: Neighborhood Client / Resident Service Discovery & Anonymous Booking
* **Role**: Neighborhood Client / Resident
* **Goal**: Browse approved services by district and submit appointment bookings without viewing other client details.
* **Scope Estimate**: Medium
* **Traceability Link**: `app/api/services/route.ts` (`GET`) | `src/components/ServiceCard.tsx` | `services` & `bookings` RLS policies

#### Acceptance Criteria
* **Given** an anonymous neighborhood visitor,
* **When** querying service offerings,
* **Then** only listings with `status = 'approved'` and active categories are returned.
* **Given** a client requesting a service,
* **When** submitting a booking request with email, requested date, and notes,
* **Then** the booking persists successfully, but client remains unable to read bookings submitted by others.

---

### Story 3: Platform Administrator Oversight
* **Role**: Platform Administrator
* **Goal**: Maintain full administrative oversight to review, approve, or deactivate listings and audit bookings.
* **Scope Estimate**: Small
* **Traceability Link**: `profiles` RLS policy (`role = 'admin'`) | `bookings` policy

#### Acceptance Criteria
* **Given** an authenticated administrator,
* **When** querying or modifying any record across `services`, `bookings`, or `profiles`,
* **Then** access is granted unconditionally through full administrative policies.