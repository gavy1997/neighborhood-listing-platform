# Row-Level Security (RLS) & Access Control Audit

## Authorization Matrix Verification

| Role / Context | Action / Endpoint | Target Entity | Expected Result | Audit Status | Technical Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Anonymous User** | `SELECT` | `services (status = 'approved')` | **PASS (200 OK)** | ✅ VERIFIED | Public policy allows reading live listings. |
| **Anonymous User** | `SELECT` | `services (status = 'draft')` | **DENIED (0 rows)** | ✅ VERIFIED | Filtered by RLS `status = 'approved'` policy condition. |
| **Anonymous User** | `INSERT` | `bookings` | **PASS (201 Created)** | ✅ VERIFIED | Public submission allowed for client bookings. |
| **Anonymous User** | `SELECT` | `bookings` | **DENIED (0 rows)** | ✅ VERIFIED | Default deny; zero read access granted to clients/anon. |
| **Provider A** | `UPDATE` | `services (Provider A, status = 'draft')` | **PASS (200 OK)** | ✅ VERIFIED | Matches `provider_id = auth.uid()` and draft check. |
| **Provider A** | `UPDATE` | `services (Provider B, status = 'draft')` | **DENIED (0 rows updated)** | ✅ VERIFIED | Enforced by strict `provider_id = auth.uid()` ownership rule. |
| **Provider A** | `UPDATE` | `services (Provider A, status = 'approved')` | **DENIED (0 rows updated)** | ✅ VERIFIED | Policy restricts updates on approved listings to prevent unauthorized edits. |
| **Provider A** | `SELECT` | `bookings (for Provider A service)` | **PASS (200 OK)** | ✅ VERIFIED | Subquery checks provider ownership on related service. |
| **Provider A** | `SELECT` | `bookings (for Provider B service)` | **DENIED (0 rows)** | ✅ VERIFIED | Subquery verification fails for unowned services. |
| **Admin** | `ALL` | All Tables | **PASS (Full Access)** | ✅ VERIFIED | Service execution / `is_admin()` helper grants override permissions. |