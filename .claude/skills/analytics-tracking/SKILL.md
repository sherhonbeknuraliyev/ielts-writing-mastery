---
name: analytics-tracking
description: Analytics and event tracking for web and mobile. Use when adding analytics, tracking user events, measuring funnels, or setting up PostHog/Mixpanel/GA4. Covers event taxonomy, SaaS funnel tracking, and privacy-compliant implementation.
---

# Analytics & Event Tracking

## Analytics Service (Provider-Agnostic)

File: `src/shared/analytics.ts`

```ts
type Properties = Record<string, unknown>;

interface AnalyticsProvider {
  track(event: string, properties?: Properties): void;
  identify(userId: string, traits?: Properties): void;
  page(name: string, properties?: Properties): void;
  reset(): void;
}

let provider: AnalyticsProvider | null = null;

export function initAnalytics(p: AnalyticsProvider) {
  provider = p;
}

export const analytics = {
  track(event: string, properties?: Properties) {
    provider?.track(event, properties);
  },
  identify(userId: string, traits?: Properties) {
    provider?.identify(userId, traits);
  },
  page(name: string, properties?: Properties) {
    provider?.page(name, properties);
  },
  reset() {
    provider?.reset();
  },
};
```

This pattern lets you swap PostHog, Mixpanel, or GA4 without touching app code.

## Provider Setup

### PostHog (Recommended — open-source, self-hostable)

```ts
// src/client/main.tsx
import posthog from "posthog-js";
import { initAnalytics } from "@shared/analytics.js";

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST ?? "https://app.posthog.com",
  persistence: "localStorage",
  autocapture: false, // Use explicit events only
});

initAnalytics({
  track: (event, props) => posthog.capture(event, props),
  identify: (id, traits) => posthog.identify(id, traits),
  page: (name) => posthog.capture("$pageview", { page: name }),
  reset: () => posthog.reset(),
});
```

`.env`:
```
VITE_POSTHOG_KEY=phc_xxxx
VITE_POSTHOG_HOST=https://app.posthog.com
```

### GA4 (Alternative)

```ts
import ReactGA from "react-ga4";
import { initAnalytics } from "@shared/analytics.js";

ReactGA.initialize(import.meta.env.VITE_GA4_ID);

initAnalytics({
  track: (event, props) => ReactGA.event(event, props as Record<string, string>),
  identify: () => {}, // GA4 uses gtag("config") for user properties
  page: (name) => ReactGA.send({ hitType: "pageview", page: name }),
  reset: () => {},
});
```

## Event Taxonomy

These are the essential events every SaaS must track. Add feature-specific events on top.

| Event | Key Properties | Trigger |
|---|---|---|
| `sign_up` | `method` (email/google/github), `plan` | Registration complete |
| `login` | `method` | Login success |
| `onboarding_step_completed` | `step_number`, `step_name` | Each onboarding step |
| `feature_used` | `feature_name`, `context` | Key feature interaction |
| `upgrade_started` | `from_plan`, `to_plan` | Clicks upgrade CTA |
| `payment_completed` | `plan`, `amount`, `currency` | Payment success |
| `subscription_cancelled` | `plan`, `reason` | Cancellation confirmed |
| `invite_sent` | `method` (email/link) | Team invite sent |
| `error_encountered` | `error_type`, `page` | Error shown to user |

## SaaS Funnel

Track every stage. Know where you lose users.

```
Visit → Sign Up → Onboard → Activate → Convert → Retain → Refer
```

| Stage | Event | Benchmark Conversion |
|---|---|---|
| Visit → Sign Up | `sign_up` | 2–5% |
| Sign Up → Onboarded | `onboarding_step_completed` (final) | 40–60% |
| Onboarded → Activated | `feature_used` (core action) | 30–50% |
| Activated → Paid | `payment_completed` | 5–25% |
| Month 1 → Month 2 | (active in period) | 40–70% |

**Activation** is the most important metric to define and optimize early.

## React Hook Pattern

File: `src/client/hooks/useTrack.ts`

```ts
import { useCallback } from "react";
import { analytics } from "@shared/analytics.js";

export function useTrack() {
  const track = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      analytics.track(event, properties);
    },
    []
  );
  return { track };
}
```

Usage in components:

```tsx
import { useTrack } from "../hooks/useTrack.js";

export function UpgradeButton({ fromPlan }: { fromPlan: string }) {
  const { track } = useTrack();

  return (
    <button
      onClick={() => {
        track("upgrade_started", { from_plan: fromPlan, to_plan: "pro" });
        // ... open upgrade modal
      }}
    >
      Upgrade to Pro
    </button>
  );
}
```

## React Native

Same shared analytics service. Initialize with the native SDK.

```ts
// src/mobile/app/_layout.tsx
import PostHog from "posthog-react-native";
import { initAnalytics } from "@shared/analytics.js";

const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_KEY!, {
  host: "https://app.posthog.com",
});

initAnalytics({
  track: (event, props) => posthog.capture(event, props),
  identify: (id, traits) => posthog.identify(id, traits),
  page: (name) => posthog.screen(name),
  reset: () => posthog.reset(),
});
```

Track screen views in navigation:

```ts
// In your navigation container
onStateChange={() => {
  const name = navigationRef.getCurrentRoute()?.name;
  if (name) analytics.page(name);
}}
```

## Server-Side Events

**Always track revenue and subscription events server-side.** Client-side tracking can be blocked by ad blockers or fail silently. Payment events must be reliable.

File: `src/server/services/analytics.service.ts`

```ts
import { PostHog } from "posthog-node";

const client = new PostHog(process.env.POSTHOG_KEY!, {
  host: process.env.POSTHOG_HOST ?? "https://app.posthog.com",
});

export const serverAnalytics = {
  track(userId: string, event: string, properties?: Record<string, unknown>) {
    client.capture({ distinctId: userId, event, properties });
  },
  shutdown() {
    return client.shutdown();
  },
};
```

Call from tRPC procedures or service layer:

```ts
// src/server/services/subscription.service.ts
import { serverAnalytics } from "./analytics.service.js";

export async function createSubscription(userId: string, plan: string, amount: number) {
  // ... create subscription in DB and Stripe
  serverAnalytics.track(userId, "payment_completed", {
    plan,
    amount,
    currency: "usd",
  });
}
```

## Privacy & Compliance

- **Cookie consent (GDPR):** Initialize analytics only after consent. Use a consent banner before calling `initAnalytics`.
- **Anonymize IP:** Enable in provider settings. PostHog does this by default; GA4 requires `anonymize_ip: true`.
- **No PII in events:** Never put emails, names, phone numbers, or addresses in event properties. Use opaque IDs only.
- **Data retention:** Set a retention policy (e.g., 12 months) in your provider dashboard.
- **Do Not Track:** Check `navigator.doNotTrack === "1"` and skip initialization if set.

```ts
// Respect DNT before initializing
if (navigator.doNotTrack !== "1") {
  posthog.init(/* ... */);
}
```

## Naming Conventions

- **snake_case** for all event names: `payment_completed` not `PaymentCompleted`
- **Past tense** for completed actions: `sign_up`, `payment_completed`, `invite_sent`
- **Present tense** for in-progress actions: `upgrade_started`, `checkout_started`
- **Flat names** — no nesting or namespacing: `feature_used` not `features.used`
- **Consistent property names** across events: always `plan`, never mix `plan`/`tier`/`subscription_type`

## Dashboard Essentials

Build these first. Everything else is secondary.

1. **Daily / Weekly Active Users** — Are people coming back?
2. **Sign-up → Activation rate** — Are new users reaching the "aha moment"?
3. **Feature adoption rates** — Which features drive retention?
4. **Churn leading indicators** — Users who drop below X logins/week churn at Y rate.

Set up these four before tracking anything else. A focused dashboard beats a bloated one.
