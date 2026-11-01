# GitHub Codespaces ♥️ Next.js

Welcome to your shiny new Codespace running Next.js! We've got everything fired up and running for you to explore Next.js.

You've got a blank canvas to work on from a git perspective as well. There's a single initial commit with the what you're seeing right now - where you go from here is up to you!

Everything you do here is contained within this one codespace. There is no repository on GitHub yet. If and when you’re ready you can click "Publish Branch" and we’ll create your repository and push up your project. If you were just exploring then and have no further need for this code then you can simply delete your codespace and it's gone forever.

To run this application:

```
npm run dev
```

## Assignment Submission Summary
- **Requirement 1 (Dev Server):** Local development server verified via `npm run dev`.
- **Requirement 2 (Feature Branch & Edit):** Feature branch created and changes made to `pages/index.js`.
- **Requirement 3 (Production Build):** Production build verified via `npm run build`.
- **Requirement 4 (Pull Request):** https://github.com/gavy1997/neighborhood-listing-platform/pull/1
## Component Hierarchy

```text
App (or Page)
├── Header / SearchFilters (Form with <label>, <select>, <button>)
├── SponsorBanner (Article/Aside, "Sponsored" badge, Accessible <a href="...">)
└── PropertyListingGrid (Tailwind responsive grid)
    └── PropertyCard (x3)
        ├── Image (with descriptive alt text)
        ├── Heading (h2 / h3 in proper document order)
        ├── Address & Price
        ├── Facts List (ul > li)
        └── CTA Link/Button ("View Details for [Property Name]")
Lab 1 submission sync update
## 🛡️ Content Correction Procedure & Media Metrics (Lab 7)

### Content Correction Protocol
If unapproved, inaccurate, or non-compliant marketing copy reaches production:
1. **Immediate Revocation:** The governance lead sets `status: "revoked"` in `src/data/copy-approved.json`.
2. **Fallback Execution:** The application falls back to displaying the verified base brand details (`Aster Corp — Workshop Registration`).
3. **Audit Log & Re-evaluation:** The incident is logged in `docs/AI_COLLABORATION_LOG.md` with the corrective prompt action taken.

### Asset Performance Metrics
- **Raw Asset:** `public/asset/raw/aster-logo-orig.png`
- **Optimized Asset:** `public/asset/optimized/aster-logo-1x1.webp`
- **Format:** WebP format provides optimal visual quality with reduced payload size, improving page load efficiency and Largest Contentful Paint (LCP) performance.