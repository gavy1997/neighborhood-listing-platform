# Assignment Submission: Dynamic Sponsor Matching & FTC Compliance

## 1. SQL / Database Query Definition

```sql
SELECT 
    s.id,
    s.company_name,
    s.destination_url,
    s.priority,
    s.impression_count
FROM public.sponsors s
JOIN public.property_sponsors ps ON s.id = ps.sponsor_id
JOIN public.properties p ON ps.property_id = p.id
WHERE p.id = \$1 -- Target property ID parameter
  -- [1] Administrative status enforcement
  AND s.status = 'APPROVED'
  -- [2] Temporal validity enforcement
  AND CURRENT_DATE BETWEEN s.start_date AND s.end_date
  -- [3] Spatial/ZIP scoping enforcement
  AND p.zip_code = s.target_zip;
  ---

## 2. Deterministic Tie-Breaking & Fallback Execution

* **Test Dataset Evaluation (Property in ZIP 90032)**:
  * **Sponsor A**: Tier: Silver (Weight: 1), Distance: 0.4 mi, Impressions: 120, Status: Approved, Dates: Active
  * **Sponsor B**: Tier: Gold (Weight: 2), Distance: 1.2 mi, Impressions: 45, Status: Approved, Dates: Active
  * **Sponsor C**: Tier: Gold (Weight: 2), Distance: 0.8 mi, Impressions: 90, Status: Approved, Dates: Active
  * **Sponsor D**: Tier: Platinum (Weight: 3), Distance: 0.2 mi, Impressions: 10, Status: **Pending**, Dates: Active

* **Selected Sponsor**: **Sponsor C**

* **Exclusion of Sponsor D**:
  Sponsor D is excluded immediately because its status is `Pending`, violating the mandatory `status = 'APPROVED'` query gatekeeper.

* **Order of Precedence Execution Trace**:
  1. **Tier Priority (Descending Weight)**: Platinum (D) is eliminated due to status. Gold sponsors (B, C) outrank Silver (A). Sponsor A is filtered out.
  2. **Proximity / Distance (Ascending)**: Comparing remaining Gold candidates (Sponsor B at $1.2\text{ miles}$ vs. Sponsor C at $0.8\text{ miles}$). Closer proximity wins, selecting Sponsor C.

---

## 3. Input Sanitization & Safe URL Unit Test

Runtime validation schema built with **Zod**:

```typescript
import { z } from 'zod';

export const sponsorUrlSchema = z.object({
  destinationUrl: z
    .string()
    .url({ message: "Invalid URL format." })
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return (
          parsed.protocol === 'https:' &&
          !parsed.hostname.match(/^\d{1,3}(\.\d{1,3}){3}\$/)
        );
      } catch {
        return false;
      }
    }, {
      message: "Security Error: URL must use secure HTTPS and cannot be a raw IP address.",
    }),
});
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "custom",
        "path": ["destinationUrl"],
        "message": "Security Error: URL must use secure HTTPS and cannot be a raw IP address."
      }
    ],
    "name": "ZodError"
  }
}
export function SponsorCard({ sponsor }: { sponsor: { company_name: string; destination_url: string } }) {
  return (
    <aside 
      aria-label="Sponsored Content" 
      className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm"
    >
      {/* Visible Disclosure Text Container */}
      <span 
        id="sponsor-disclaimer" 
        className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block"
      >
        Sponsored Partner
      </span>

      <h4 className="text-base font-bold text-slate-900">
        {sponsor.company_name}
      </h4>

      {/* Accessible Call-to-Action Link */}
      <a 
        href={sponsor.destination_url}
        aria-describedby="sponsor-disclaimer"
        aria-label={`Sponsored link to ${sponsor.company_name}, opens in a new tab`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 text-sm font-medium text-blue-600 hover:underline"
      >
        Learn More
      </a>
    </aside>
  );
}