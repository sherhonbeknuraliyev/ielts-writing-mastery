---
name: email-templates
description: Email template patterns for transactional and marketing emails. Use when sending welcome emails, password resets, invoices, onboarding sequences, or any email from the application. Covers Resend/SendGrid integration with React Email templates.
---

# Email Templates

## Provider Setup

**Resend** (recommended — built for developers, generous free tier):
```bash
npm install resend @react-email/components react react-dom
```

File: `src/server/services/email.service.ts`

```ts
import { Resend } from 'resend';
import { createElement } from 'react';
import { renderAsync } from '@react-email/components';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? 'Sarah from AppName <sarah@yourapp.com>';
```

**SendGrid** alternative:
```ts
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
```

## Send Email Helper

```ts
interface SendEmailOptions<TProps> {
  to: string;
  subject: string;
  template: React.FC<TProps>;
  props: TProps;
}

export async function sendEmail<TProps>({
  to,
  subject,
  template,
  props,
}: SendEmailOptions<TProps>): Promise<void> {
  const html = await renderAsync(createElement(template, props));

  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });
}
```

## React Email Template Example

File: `src/server/emails/WelcomeEmail.tsx`

```tsx
import {
  Body, Button, Container, Head, Heading,
  Html, Preview, Section, Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
  appUrl: string;
}

export function WelcomeEmail({ name, appUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to AppName — here's how to get started</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }}>
          <Heading style={{ color: '#1a1a1a', fontSize: '24px', fontWeight: 'bold' }}>
            Welcome, {name}
          </Heading>
          <Text style={{ color: '#444', fontSize: '16px', lineHeight: '1.6' }}>
            Your account is ready. Here's what to do next:
          </Text>
          <Section>
            <Text style={{ color: '#444', fontSize: '15px' }}>
              1. Complete your profile<br />
              2. Connect your first integration<br />
              3. Invite your team
            </Text>
          </Section>
          <Button
            href={appUrl}
            style={{
              backgroundColor: '#4f46e5',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Get started
          </Button>
          <Text style={{ color: '#999', fontSize: '13px', marginTop: '32px' }}>
            You received this because you created an account.{' '}
            <a href="{unsubscribeUrl}" style={{ color: '#999' }}>Unsubscribe</a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

**Trigger from tRPC (after signup):**
```ts
import { sendEmail } from '../services/email.service.js';
import { WelcomeEmail } from '../emails/WelcomeEmail.js';

await sendEmail({
  to: user.email,
  subject: 'Welcome to AppName',
  template: WelcomeEmail,
  props: { name: user.name, appUrl: process.env.APP_URL! },
});
```

## Essential Transactional Emails

| Email | Trigger | Must include |
|---|---|---|
| Welcome | After signup | App link, next steps |
| Email verification | After signup | Verify link (expires 24h) |
| Password reset | User request | Reset link (expires 1h) |
| Invoice / receipt | After payment | Amount, plan, date, invoice PDF |
| Subscription change | Plan up/downgrade | New plan, billing date, amount |
| Trial ending | 3 days before expiry | Upgrade CTA, what they'll lose |

**Password reset example trigger:**
```ts
const token = crypto.randomBytes(32).toString('hex');
const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
await PasswordReset.create({ userId: user._id, token, expires });

await sendEmail({
  to: user.email,
  subject: 'Reset your password',
  template: PasswordResetEmail,
  props: {
    resetUrl: `${process.env.APP_URL}/reset-password?token=${token}`,
  },
});
```

## Onboarding Drip Sequence

Schedule with a job queue (BullMQ, Inngest, or a simple cron).

| Day | Subject | Goal |
|---|---|---|
| 0 | Welcome to {app} | Activation — get first action done |
| 1 | Quick tip: {key feature} | Education — reduce time-to-value |
| 3 | How {persona} uses {app} | Social proof — build confidence |
| 7 | You're missing out on... | Feature discovery — expand usage |
| 14 | Upgrade for {value prop} | Conversion — trial-to-paid |

**Schedule on signup:**
```ts
await scheduleOnboardingSequence(user._id, user.email);

async function scheduleOnboardingSequence(userId: string, email: string) {
  const sequence = [
    { delayDays: 1, type: 'tip' },
    { delayDays: 3, type: 'social_proof' },
    { delayDays: 7, type: 'feature_discovery' },
    { delayDays: 14, type: 'upgrade' },
  ];
  for (const { delayDays, type } of sequence) {
    await emailQueue.add('send_onboarding', { userId, email, type }, {
      delay: delayDays * 24 * 60 * 60 * 1000,
    });
  }
}
```

## Email Best Practices

| Area | Rule |
|---|---|
| Subject line | 30–50 chars, personalize with name, A/B test variants |
| From name | Real person — "Sarah from AppName" converts better than "noreply@" |
| Preheader | Extend the subject line (shown in inbox preview, ~90 chars) |
| CTA | Single call-to-action per email — one job, one button |
| Mobile | Design mobile-first; 60%+ of opens are on mobile |
| Unsubscribe | Required by CAN-SPAM / GDPR — include in every marketing email |
| Plain text | Always send a plain text version alongside HTML |
| Images | Don't rely on images — many clients block them by default |

## Email Deliverability

Configure DNS records on your sending domain:

```
# SPF — authorize Resend to send on your behalf
TXT @ "v=spf1 include:amazonses.com ~all"

# DKIM — cryptographic signature (Resend generates the key)
CNAME resend._domainkey  resend._domainkey.resend.com

# DMARC — policy for unauthenticated mail
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourapp.com"
```

- Use a **dedicated sending subdomain** (`mail.yourapp.com`) to protect your root domain reputation.
- Warm up new domains by starting with low volume and ramping over 2–4 weeks.
- Monitor bounce/spam rates in the Resend dashboard — keep bounces under 2%, spam under 0.1%.

## Environment Variables

```bash
# .env
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM="Sarah from AppName <sarah@mail.yourapp.com>"
APP_URL=https://yourapp.com
```

Add to `.env.example`:
```bash
RESEND_API_KEY=
EMAIL_FROM="AppName <hello@mail.yourapp.com>"
APP_URL=http://localhost:3000
```
