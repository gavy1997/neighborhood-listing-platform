# Security audit — Local Services & Bookings

## Controls reviewed

- Row-level security is enabled on `profiles`, `service_categories`, `services`, `service_category_mappings`, and `bookings`.
- Public service reads return approved services.
- Booking access is restricted by RLS; providers can read bookings for their own services.
- The admin routes verify the user's bearer token and `profiles.role = 'admin'` before using the server-side service client.
- Admin approval changes a service only when its current status is `draft`.
- The service-role key is kept in the server environment and is not sent to the browser.

## Verification

- Anonymous direct read of `bookings`: denied by Supabase.
- Provider owner read of own service bookings: succeeded.
- Other authenticated user read of bookings: returned no rows.
- Admin bookings endpoint: HTTP 200.
- Admin approval of a draft service: returned `approved`.
- Provider attempt to approve a service: HTTP 403.
- Public services query included the approved test service.
- `npm test`: 8 tests passed.
- `npm run build`: passed, including `/api/admin/bookings` and `/api/admin/services`.

## Test data

The approval check used a fictional service named `Exam Approval Test Service`.