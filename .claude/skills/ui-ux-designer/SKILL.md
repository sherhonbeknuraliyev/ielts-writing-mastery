---
name: ui-ux-designer
description: UI/UX design patterns for React and React Native. Use when designing user interfaces, creating design systems, generating color palettes, planning user research, creating personas, journey mapping, or working on visual consistency across web and mobile.
---

# UI/UX Designer Skill

## Color Psychology

**62–90% of first impressions are based on color alone. Consistent color systems increase brand recognition by 80%.**

### Color Emotions & Usage

| Color  | Emotion/Association                  | Best for                        | Avoid for               |
|--------|--------------------------------------|---------------------------------|-------------------------|
| Blue   | Trust, security, calm, professional  | SaaS, fintech, healthcare, B2B  | Food, urgency-driven    |
| Red    | Urgency, passion, energy, danger     | CTAs, sales, errors, alerts     | Finance, healthcare     |
| Green  | Growth, health, success, nature      | Wellness, profit, confirmations | Luxury brands           |
| Orange | Friendly, creative, energetic        | CTAs, SaaS pricing, startups    | Luxury, corporate       |
| Purple | Premium, wisdom, innovation          | Fintech, luxury, education      | Budget brands           |
| Yellow | Optimism, warmth, attention          | Warnings, accents, child apps   | Large areas (eye strain)|
| Black  | Sophistication, luxury, power        | Premium brands, fashion         | Healthcare, wellness    |
| White  | Clean, minimal, spacious             | All industries, backgrounds     | —                       |

### 60-30-10 Rule

- **60% Primary** — neutral/trust (white, gray, navy): backgrounds, large areas
- **30% Secondary** — brand color (blue, green, purple): cards, headers, nav
- **10% Accent** — action color (orange, red, green): CTAs, badges, alerts

### Industry Color Guide

| Industry    | Primary            | Accent            | Why                     |
|-------------|--------------------|-------------------|-------------------------|
| SaaS/B2B    | Blue `#2563eb`     | Orange            | Trust + action          |
| Fintech     | Navy `#1e3a8a`     | Teal              | Authority + innovation  |
| Healthcare  | Teal `#0d9488`     | Green             | Calm + health           |
| E-commerce  | Neutral + brand    | Red/Orange CTA    | Trust + urgency         |
| Education   | Purple `#7c3aed`   | Green             | Wisdom + growth         |
| Wellness    | Green `#16a34a`    | Warm neutrals     | Nature + health         |

### CTA Button Psychology

Best converting CTA = **highest contrast against its background** (Von Restorff / Isolation Effect).

- **Orange** — enthusiasm + action (top performer)
- **Green** — "go" signal + trust; HubSpot: green CTA = +21% vs gray; Unbounce: +35% sign-ups vs blue
- **Red** — urgency + importance
- **Navy + Orange** — tested 34% more trustworthy than other pairings
- Rule: the specific color matters less than **contrast against surroundings**

### Cultural Color Differences

| Color  | Western              | East Asian                     | Middle East     |
|--------|----------------------|--------------------------------|-----------------|
| White  | Purity, clean        | Death, mourning                | Purity          |
| Red    | Danger, passion      | Luck, prosperity               | Danger          |
| Yellow | Optimism             | Royalty (China), Bravery (JP)  | Happiness       |
| Green  | Growth, money        | —                              | Islam, paradise |
| Purple | Luxury               | —                              | Wealth          |

### Color Blindness & Accessibility

- **8% of men, 0.5% of women** have color vision deficiency
- Never use color **alone** to convey meaning — always add icons, text, or patterns
- Avoid **red/green pairs** (most common deficiency: deuteranopia)
- Avoid **blue/purple pairs**
- Test with grayscale: information must still be clear
- WCAG AA: 4.5:1 contrast for normal text, 3:1 for large text (18pt+) and UI components
- `primary-500` on white = 4.6:1 (AA). `primary-600` on white = 6.3:1 (AAA).

---

## Shared Theme — `src/shared/constants/theme.ts`

Single source of truth for web (CSS vars) and mobile (StyleSheet). **Never hardcode a color or spacing value.**

```ts
export const theme = {
  colors: {
    primary:  { 50:'#eff6ff', 100:'#dbeafe', 200:'#bfdbfe', 300:'#93c5fd',
                400:'#60a5fa', 500:'#3b82f6', 600:'#2563eb', 700:'#1d4ed8',
                800:'#1e40af', 900:'#1e3a8a' },
    gray:     { 50:'#f9fafb', 100:'#f3f4f6', 200:'#e5e7eb', 300:'#d1d5db',
                400:'#9ca3af', 500:'#6b7280', 600:'#4b5563', 700:'#374151',
                800:'#1f2937', 900:'#111827' },
    semantic: { success:'#16a34a', warning:'#d97706', error:'#dc2626', info:'#0284c7' },
  },
  spacing: { 0:0, 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 8:32, 10:40, 12:48, 16:64 },
  radius:  { sm:4, md:8, lg:12, xl:16, full:9999 },
  font: {
    size:   { xs:12, sm:14, base:16, lg:18, xl:20, '2xl':24, '3xl':30, '4xl':36 },
    weight: { normal:'400', medium:'500', semibold:'600', bold:'700' } as const,
    family: { sans:'Inter, system-ui, sans-serif', mono:'JetBrains Mono, monospace' },
  },
  shadow: {
    sm: '0 1px 2px rgb(0 0 0/0.05)',
    md: '0 4px 6px -1px rgb(0 0 0/0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0/0.1)',
  },
} as const;

export type Theme = typeof theme;
```

Spacing follows an **8pt grid**. Typography uses a **1.25 ratio** scale. Breakpoints: sm 640px / md 768px / lg 1024px / xl 1280px / 2xl 1536px.

---

## Web: CSS Custom Properties

```ts
// src/client/utils/injectCssVars.ts
import { theme } from '@shared/constants/theme.js';
export function injectCssVars() {
  const root = document.documentElement.style;
  Object.entries(theme.colors.primary).forEach(([k, v]) =>
    root.setProperty(`--color-primary-${k}`, v));
  Object.entries(theme.spacing).forEach(([k, v]) =>
    root.setProperty(`--spacing-${k}`, `${v}px`));
}
```

```css
.btn { background: var(--color-primary-500); padding: var(--spacing-2) var(--spacing-4); }
```

---

## React Component — Variant Pattern

```tsx
// src/client/components/Button.tsx
type Size = 'sm' | 'md' | 'lg';
type Variant = 'primary' | 'secondary' | 'ghost';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size; variant?: Variant;
}
const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-base', lg: 'px-6 py-3 text-lg',
};
const variantStyles: Record<Variant, string> = {
  primary:   'bg-primary-500 text-white hover:bg-primary-600',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  ghost:     'bg-transparent text-primary-600 hover:bg-primary-50',
};
export function Button({ size = 'md', variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={`rounded-lg font-medium transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props} />;
}
```

---

## React Native Component — Same Theme

```tsx
// src/mobile/components/Button.tsx
import { StyleSheet, Pressable, Text } from 'react-native';
import { theme } from '@shared/constants/theme.js';
type Variant = 'primary' | 'secondary' | 'ghost';
interface ButtonProps { label: string; onPress: () => void; size?: 'sm'|'md'|'lg'; variant?: Variant; }

export function Button({ label, onPress, size = 'md', variant = 'primary' }: ButtonProps) {
  return (
    <Pressable style={[styles.base, styles[size], styles[variant]]} onPress={onPress}>
      <Text style={[styles.label, variant === 'primary' ? styles.labelLight : styles.labelDark]}>
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base:       { borderRadius: theme.radius.md, alignItems: 'center' },
  sm:         { paddingHorizontal: theme.spacing[3], paddingVertical: theme.spacing[1] },
  md:         { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[2] },
  lg:         { paddingHorizontal: theme.spacing[6], paddingVertical: theme.spacing[3] },
  primary:    { backgroundColor: theme.colors.primary[500] },
  secondary:  { backgroundColor: theme.colors.gray[100] },
  ghost:      { backgroundColor: 'transparent' },
  label:      { fontSize: theme.font.size.base, fontWeight: theme.font.weight.medium },
  labelLight: { color: '#ffffff' },
  labelDark:  { color: theme.colors.gray[800] },
});
```

---

## UX: Persona Template

```
Name: [Archetype name]
Role: [Job title], [Company type]
Age: [Range]  |  Tech comfort: Low / Mid / High

Goals:         1. [Primary goal]  2. [Secondary goal]
Frustrations:  1. [Pain point]    2. [Pain point]
Behavior:      [1-2 sentences on how they use the product]
Quote:         "[Representative quote]"
```

---

## Journey Map Stages

| Stage      | User action         | Emotion | Touchpoint   | Opportunity           |
|------------|---------------------|---------|--------------|----------------------|
| Awareness  | Sees ad / referral  | Curious | Social, search | Clear value prop   |
| Onboarding | Signs up, first use | Hopeful | App, email   | Reduce friction      |
| Activation | Hits "aha" moment   | Excited | Core feature | Shorten time-to-value|
| Retention  | Returns after day 3 | Habit   | Push, email  | Habit loop           |
| Advocacy   | Refers a friend     | Proud   | Share flow   | Referral incentive   |

---

## Usability Testing

| Method        | Sample | When to use               | Cost |
|---------------|--------|---------------------------|------|
| Moderated 1:1 | 5–8    | Early concept validation  | High |
| Unmoderated   | 15–30  | Task flow testing         | Med  |
| 5-second test | 20+    | First impression clarity  | Low  |
| A/B test      | 100+   | Conversion optimization   | Low  |
| Card sorting  | 15–20  | Navigation/IA             | Med  |

**Before testing:** defined hypotheses / tasks as goals not instructions / target persona screener / consent + recording ready.

---

## Research Synthesis

**Coding tags:** `#navigation` `#onboarding` `#performance` `#copy` `#confusion` `#delight`

**Priority score** = Frequency × Severity

| Severity | Score | Definition                              |
|----------|-------|-----------------------------------------|
| Critical | 4     | Blocks task completion                  |
| Major    | 3     | Significant struggle, workaround needed |
| Minor    | 2     | Friction, task completed                |
| Cosmetic | 1     | Preference, no impact                   |

Fix Critical first. Ignore Cosmetic until Critical/Major are resolved.

```
Finding: [1 sentence]
Evidence: "[quote]" — User 3; also seen in Users 1, 5, 7
Tag: #onboarding
Score: 3 × 4 = 12 → Priority: HIGH
Recommendation: [Specific design change]
```
