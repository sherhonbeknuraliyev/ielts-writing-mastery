---
name: pricing-strategy
description: SaaS pricing design and optimization. Use when building pricing tiers, choosing value metrics, planning price increases, or designing a pricing page. Covers good-better-best packaging, usage-based pricing, and freemium models.
---

# Pricing Strategy

## Pricing Model Decision Tree

```
Is your product self-serve?
├── Yes → Is usage predictable per user?
│   ├── Yes → Per-seat pricing (Slack, Figma)
│   └── No → Usage-based pricing (Vercel, Twilio)
└── No (sales-assisted) → Tiered pricing with custom enterprise
```

## Good-Better-Best Framework

| Element | Free/Starter | Pro | Enterprise |
|---------|-------------|-----|------------|
| Purpose | Acquisition | Revenue | Expansion |
| Price | $0 | $X/mo | Custom |
| Users | 1 | Up to N | Unlimited |
| Features | Core only | Core + advanced | Everything + SSO, SLA |
| Support | Community | Email | Dedicated |
| Target | Individual | Team | Organization |

## Pricing Page Checklist
- [ ] 3 tiers max (decision paralysis above 3)
- [ ] Highlight the recommended plan visually
- [ ] Show annual discount (typically 20%)
- [ ] List features with checkmarks, not paragraphs
- [ ] Include FAQ addressing objections
- [ ] Add social proof near CTA
- [ ] Free tier or free trial to reduce friction

## Value Metric Selection
The best value metric:
- Scales with customer success (they pay more as they get more value)
- Is predictable (customers can estimate their cost)
- Is measurable (you can track it technically)

Common value metrics:
- **Per seat** — simple, predictable, limits adoption
- **Per usage** (API calls, storage, messages) — fair, complex to predict
- **Per feature** — easy to understand, can feel like nickel-and-diming
- **Flat rate** — simplest, leaves money on table

## Price Increase Playbook
1. Grandfather existing customers for 3-6 months
2. Announce 60 days in advance with clear reasoning
3. Frame around new value added, not cost increase
4. Offer annual lock-in at old price
5. Segment: increase for new customers first, then existing
