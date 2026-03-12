---
name: landing-page
description: Landing page generation for this React project. Use when creating marketing pages, homepage redesigns, or conversion-optimized pages. Generates React components with inline styles matching this project's patterns.
---

# Landing Page Generator

## Section Order (proven to convert)
1. **Hero** — Headline + subheadline + CTA + optional image
2. **Social Proof** — Logos, user count, testimonials
3. **Problem** — Pain point the audience recognizes
4. **Solution** — How your product solves it (3 benefits)
5. **Features** — 3-6 features with icons
6. **How It Works** — 3 steps
7. **Pricing** — Tiers (if applicable)
8. **Testimonials** — 2-3 quotes with names
9. **FAQ** — 4-6 common objections as questions
10. **CTA** — Final call to action

## Copy Frameworks

### PAS (Problem → Agitate → Solution)
- **H1:** State the painful problem
- **Sub:** What happens if they don't fix it
- **CTA:** Your solution as the answer

### BAB (Before → After → Bridge)
- **H1:** Life before your product (painful)
- **Sub:** Life after (transformed)
- **CTA:** Your product is the bridge

## Headline Formulas
- "[Outcome] without [pain point]"
- "The [tool/platform] that [benefit]"
- "Stop [bad thing]. Start [good thing]."
- "[Number] [people] use [product] to [outcome]"

## Implementation
Create as a React page in `src/client/pages/LandingPage.tsx`:
- Use inline styles or add a CSS file
- Keep components in `src/client/components/landing/`
- Each section is its own component (< 300 lines each)
- Add route in `src/client/App.tsx`

## Conversion Tips
- One CTA per page (repeated, same action)
- Above the fold: headline + CTA visible without scrolling
- Social proof near the CTA reduces friction
- Specificity beats vagueness ("500+ teams" beats "many teams")
