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

# Security Audit & Row-Level Security (RLS) Verification Matrix

| Role / User Persona | Target Table / Operation | Expected Result | Technical Policy / Rule Applied | Verified Status |
| :--- | :--- | :--- | :--- | :--- |
| **Anonymous** | `SELECT` on `services` (`status = 'approved'`) | **PASS / ALLOWED** | `services_public_read_approved` | PASS |
| **Anonymous** | `SELECT` on `services` (`status = 'draft'`) | **FAIL / DENIED** | Default-Deny RLS Filter | PASS |
| **Anonymous / Client** | `INSERT` into `bookings` | **PASS / ALLOWED** | `bookings_public_insert` | PASS |
| **Client / Public** | `SELECT` on `bookings` | **FAIL / DENIED** | Default-Deny (Only admin & provider can read) | PASS |
| **Provider A** | `UPDATE` on Provider A draft listing | **PASS / ALLOWED** | `services_provider_manage_own` (`provider_id = auth.uid()`) | PASS |
| **Provider A** | `UPDATE` on Provider B service listing | **FAIL / DENIED** | `provider_id = auth.uid()` constraint check | PASS |
| **Provider A** | `UPDATE` on Provider A `approved` listing | **FAIL / DENIED** | Status check constraint (`status IN ('draft', 'suspended')`) | PASS |
| **Admin** | `SELECT` / `UPDATE` across all tables | **PASS / ALLOWED** | `admin_full_access` (`role = 'admin'`) | PASS |