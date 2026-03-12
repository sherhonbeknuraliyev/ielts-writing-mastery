---
name: stripe-payments
description: Stripe payment integration for SaaS billing. Use when adding subscriptions, one-time payments, customer portal, webhooks, or pricing pages. Covers Stripe Checkout, Billing, and webhook handling for Express + tRPC + React.
---

# Stripe Payments

## Setup

```bash
npm install stripe @stripe/stripe-js
```

`.env`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
```

## Server-side Stripe Client

File: `src/server/services/stripe.service.ts`

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function createCheckoutSession({
  priceId,
  customerId,
  customerEmail,
  userId,
}: {
  priceId: string;
  customerId?: string;
  customerEmail: string;
  userId: string;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: customerId,
    customer_email: customerId ? undefined : customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/billing/cancel`,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
  });
  return session.url!;
}

export async function createPortalSession(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.CLIENT_URL}/billing`,
  });
  return session.url;
}
```

## Subscription Fields on User Model

File: `src/server/models/user.model.ts` — add to Mongoose schema:

```ts
stripeCustomerId: { type: String },
subscriptionId: { type: String },
subscriptionStatus: {
  type: String,
  enum: ["active", "trialing", "past_due", "canceled", "unpaid", "none"],
  default: "none",
},
currentPeriodEnd: { type: Date },
priceId: { type: String },
```

## tRPC Router

File: `src/server/routers/billing.router.ts`

```ts
import { z } from "zod";
import { router, protectedProcedure } from "../trpc/trpc.js";
import { createCheckoutSession, createPortalSession } from "../services/stripe.service.js";
import { UserModel } from "../models/user.model.js";

export const billingRouter = router({
  createCheckout: protectedProcedure
    .input(z.object({ priceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await UserModel.findById(ctx.user.id).lean();
      const url = await createCheckoutSession({
        priceId: input.priceId,
        customerId: user?.stripeCustomerId,
        customerEmail: ctx.user.email,
        userId: ctx.user.id,
      });
      return { url };
    }),

  createPortal: protectedProcedure
    .mutation(async ({ ctx }) => {
      const user = await UserModel.findById(ctx.user.id).lean();
      if (!user?.stripeCustomerId) throw new Error("No billing account found");
      const url = await createPortalSession(user.stripeCustomerId);
      return { url };
    }),

  getStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await UserModel.findById(ctx.user.id)
        .select("subscriptionStatus currentPeriodEnd priceId")
        .lean();
      return {
        status: user?.subscriptionStatus ?? "none",
        currentPeriodEnd: user?.currentPeriodEnd ?? null,
        priceId: user?.priceId ?? null,
      };
    }),
});
```

Register in `src/server/routers/index.ts`: add `billing: billingRouter` to the router map.

## Webhook Handler

Must use raw body — register BEFORE `express.json()` in `src/server/index.ts`:

```ts
// Raw body required for signature verification — must come before express.json()
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
app.use(express.json());
```

File: `src/server/webhooks/stripe.webhook.ts`

```ts
import { Request, Response } from "express";
import { stripe } from "../services/stripe.service.js";
import { UserModel } from "../models/user.model.js";
import Stripe from "stripe";

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return res.status(400).send("Webhook signature verification failed");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription") {
          await UserModel.findByIdAndUpdate(session.metadata?.userId, {
            stripeCustomerId: session.customer as string,
            subscriptionId: session.subscription as string,
            subscriptionStatus: "active",
          });
        }
        break;
      }
      case "invoice.paid":
      case "customer.subscription.updated": {
        // invoice.paid: renewal succeeded; subscription.updated: plan/status changed
        const obj = event.data.object as Stripe.Invoice | Stripe.Subscription;
        const subId = "subscription" in obj ? obj.subscription as string : obj.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        await UserModel.findOneAndUpdate(
          { subscriptionId: sub.id },
          {
            subscriptionStatus: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            priceId: sub.items.data[0]?.price.id,
          }
        );
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await UserModel.findOneAndUpdate(
          { subscriptionId: invoice.subscription as string },
          { subscriptionStatus: "past_due" }
        );
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await UserModel.findOneAndUpdate(
          { subscriptionId: sub.id },
          { subscriptionStatus: "canceled", subscriptionId: null }
        );
        break;
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).send("Webhook processing failed");
  }
}
```

## Pricing Page (React)

File: `src/client/pages/PricingPage.tsx`

```tsx
import { trpc } from "@client/lib/trpc";

const PLANS = [
  { name: "Pro", priceId: import.meta.env.VITE_STRIPE_PRICE_ID_PRO, price: "$29/mo" },
  { name: "Enterprise", priceId: import.meta.env.VITE_STRIPE_PRICE_ID_ENTERPRISE, price: "$99/mo" },
];

export function PricingPage() {
  const checkout = trpc.billing.createCheckout.useMutation({
    onSuccess: ({ url }) => { window.location.href = url; },
  });
  const { data: status } = trpc.billing.getStatus.useQuery();
  const portal = trpc.billing.createPortal.useMutation({
    onSuccess: ({ url }) => { window.location.href = url; },
  });

  if (status?.status === "active") {
    return (
      <div>
        <p>Active plan — <strong>{status.priceId}</strong></p>
        <button onClick={() => portal.mutate()}>Manage Billing</button>
      </div>
    );
  }

  return (
    <div>
      {PLANS.map((plan) => (
        <div key={plan.priceId}>
          <h3>{plan.name}</h3>
          <p>{plan.price}</p>
          <button
            disabled={checkout.isPending}
            onClick={() => checkout.mutate({ priceId: plan.priceId })}
          >
            Subscribe
          </button>
        </div>
      ))}
    </div>
  );
}
```

Add `VITE_STRIPE_PUBLISHABLE_KEY` and price IDs to `.env` for the client.

## Pricing Models

| Model | Stripe Setup | Use Case |
|---|---|---|
| Flat monthly | Single price, `recurring` | Simple SaaS |
| Tiered | Multiple prices, user picks | Good-better-best |
| Usage-based | Metered billing, report usage | API/infra products |
| Per-seat | `quantity` on subscription | Team/org products |

## Testing

```bash
stripe login
stripe listen --forward-to localhost:4000/api/stripe/webhook
stripe trigger checkout.session.completed  # test specific events
```

Test cards (any future expiry, any CVC):
- `4242 4242 4242 4242` — success
- `4000 0000 0000 0002` — card declined
- `4000 0025 0000 3155` — requires 3D Secure

## Security Checklist

- Never expose `STRIPE_SECRET_KEY` to the client or commit it to git
- Always verify webhook signatures — never trust unverified payloads
- `express.raw()` on the webhook route is mandatory (JSON parsing breaks signature verification)
- Use idempotency keys for retried mutations: pass `{ idempotencyKey }` as second arg to Stripe calls
- Store only `stripeCustomerId` / `subscriptionId` — never store raw card data
- Gate features by `subscriptionStatus === "active"` server-side, not just on the client
