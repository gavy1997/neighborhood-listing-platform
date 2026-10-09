# Lab 4: User Stories, Acceptance Criteria, Product Backlog, and Approval Workflow

## Steps 9 & 10: User Stories & Given/When/Then Acceptance Criteria

### Story 1 (High Priority – MVP Scope)
**As a** Property Manager,  
**I want** to feature a neighborhood property listing with key details and photo placeholders,  
**so that** prospective buyers can view a structured summary of the property.

* **Given** I am on the BarrioList dashboard and authorized as a Property Professional,
* **When** I submit a new property with valid title, price, address, and image asset,
* **Then** the system renders a `PropertyCard` on the neighborhood feed displaying these details.

---

### Story 2 (High Priority – MVP Scope)
**As a** Local Business Sponsor,  
**I want** to submit a sponsorship banner claim for a specific neighborhood listing,  
**so that** my local business gains targeted exposure to prospective buyers.

* **Given** I am on the Sponsor Claim submission page,
* **When** I upload a banner image, business title, and target link URL,
* **Then** the claim enters the "Pending Approval" state in the content approval queue.

---

### Story 3 (High Priority – Content Approval Workflow)
**As a** Property Manager,  
**I want** to review and approve/reject pending sponsor banners for my listings,  
**so that** only appropriate local businesses appear alongside my properties.

* **Given** there are pending sponsor claims in my review queue,
* **When** I click "Approve" on a valid sponsor banner claim,
* **Then** the `SponsorBanner` component becomes visible on the public `PropertyCard` view.

---

### Story 4 (High Priority – Accessibility)
**As a** visually impaired home buyer,  
**I want** all property cards and sponsor banners to support screen readers and keyboard navigation,  
**so that** I can access property details regardless of accessibility needs.

* **Given** I am navigating the platform using a screen reader or keyboard tabbing,
* **When** I tab through `PropertyCard` and `SponsorBanner` interactive elements,
* **Then** all images have descriptive `alt` text and focus outlines are clearly visible.

---

### Story 5
**As a** Property Manager, **I want** to update property details (e.g., price changes or status updates), **so that** buyers always view current listing data.

---

### Story 6
**As a** Local Business Sponsor, **I want** to view basic impression counts for my active banner, **so that** I can evaluate sponsorship engagement.

---

### Story 7
**As a** Buyer, **I want** to filter listings by neighborhood name, **so that** I can focus on properties in my preferred target area.

---

### Story 8
**As a** System Admin, **I want** to manage user role permissions (Property Professional, Sponsor, Admin), **so that** application data remains secure.

---

## Steps 11 & 12: GitHub Board Setup & Week 8 MVP Scope

### Project Board Structure
1. **Backlog:** Unscheduled user stories and future enhancements.
2. **Ready:** Refined user stories with completed acceptance criteria ready for development.
3. **In Progress:** Work actively assigned to team members.
4. **Review:** Open Pull Requests pending code or accessibility review.
5. **Done:** Merged and verified deliverables.

### Week 8 MVP Scope & Work Estimation
| Item / User Story | Size | Assignee | Included in Week 8 MVP? |
| :--- | :---: | :--- | :---: |
| Next.js App Shell & Layout Setup | Small | Developer | **Yes** |
| `PropertyCard` Component & Mock Data | Medium | Dev / Tech Lead | **Yes** |
| `SponsorBanner` Component & Placement | Medium | Front-end Lead | **Yes** |
| Content Approval Review Queue Interface | Large | Dev / Accessibility Lead | **Yes** |
| Accessibility Audit (WCAG AA Focus Management) | Small | Test / Accessibility Lead | **Yes** |
| AI Provenance Log & Requirements Docs | Small | Documentation Lead | **Yes** |
| Advanced Performance Analytics Dashboard | Large | Unassigned | No (Post-MVP) |
| Automated Stripe Payment Integration | Large | Unassigned | No (Post-MVP) |

---

## Step 13: Content Approval Workflow Setup