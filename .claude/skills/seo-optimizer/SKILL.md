---
name: seo-optimizer
description: SEO optimization for React SPA with Express backend. Use when adding meta tags, structured data, sitemaps, Open Graph tags, improving page speed, or optimizing for search engines. Covers SPA-specific challenges like SSR, prerendering, and dynamic meta.
---

# SEO Optimizer

## 1. React SPA SEO Challenges

SPAs render in the browser — crawlers may receive an empty `<div id="root">` before JS executes.

| Problem | Solution |
|---|---|
| Empty HTML on first load | Prerendering or SSR |
| Dynamic `<title>` / meta | react-helmet-async |
| Single URL for all content | Client-side routing + canonical tags |
| Slow JS parse time | Code splitting, lazy routes |

Install and wrap the app once:

```bash
npm install react-helmet-async
```

```tsx
// src/client/main.tsx
import { HelmetProvider } from "react-helmet-async";
root.render(<HelmetProvider><App /></HelmetProvider>);
```

## 2. SEO Component (Meta + Open Graph + Twitter Card)

File: `src/client/components/SEO.tsx`

```tsx
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  noIndex?: boolean;
}

const SITE_NAME = "Your App";
const BASE_URL = import.meta.env.VITE_PUBLIC_URL ?? "https://yourapp.com";
const DEFAULT_IMAGE = `${BASE_URL}/og-default.png`;

export function SEO({ title, description, image = DEFAULT_IMAGE, url, type = "website", noIndex = false }: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonical = url ? `${BASE_URL}${url}` : undefined;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
```

Usage: `<SEO title="Pricing" description="Simple pricing." url="/pricing" />`

## 3. Structured Data (JSON-LD)

File: `src/client/components/JsonLd.tsx`

```tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
```

Common schemas:

```tsx
// Organization — use on homepage
const orgSchema = { "@context": "https://schema.org", "@type": "Organization",
  name: "Your App", url: "https://yourapp.com", logo: "https://yourapp.com/logo.png" };

// FAQ — use on FAQ/feature pages
const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [{ "@type": "Question", name: "How does billing work?",
    acceptedAnswer: { "@type": "Answer", text: "Monthly or annual..." } }] };

// BreadcrumbList
const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://yourapp.com" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://yourapp.com/blog" },
  ] };
```

Inject via Helmet: `<Helmet><JsonLd data={orgSchema} /></Helmet>`

## 4. Sitemap Generation (Express)

File: `src/server/routes/sitemap.ts`

```ts
import { Router } from "express";

const STATIC_ROUTES = ["/", "/pricing", "/about", "/blog"];
const BASE_URL = process.env.PUBLIC_URL ?? "https://yourapp.com";

export const sitemapRouter = Router();

sitemapRouter.get("/sitemap.xml", async (_req, res) => {
  // const posts = await PostService.getAllSlugs(); // add dynamic routes here
  const urls = STATIC_ROUTES.map((path) => ({ loc: `${BASE_URL}${path}`, priority: "1.0" }));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ loc, priority }) =>
  `  <url><loc>${loc}</loc><lastmod>${new Date().toISOString().split("T")[0]}</lastmod><priority>${priority}</priority></url>`
).join("\n")}
</urlset>`;
  res.set("Content-Type", "application/xml").send(xml);
});
```

## 5. robots.txt (Express)

```ts
// src/server/index.ts
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(
    `User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /admin\nSitemap: ${process.env.PUBLIC_URL}/sitemap.xml`
  );
});
```

## 6. Technical SEO Checklist

| Item | Implementation |
|---|---|
| Canonical URLs | `<link rel="canonical">` via SEO component |
| hreflang (i18n) | `<link rel="alternate" hreflang="fr" href="...">` in Helmet |
| 301 redirects | `res.redirect(301, "/new-path")` in Express |
| 404 handling | React Router catch-all route + Express 404 middleware |
| Image alt tags | Always set `alt`; use `alt=""` for decorative images |
| Lazy loading | `<img loading="lazy">` on below-fold images |
| WebP format | `<picture>` with WebP source + PNG fallback |
| LCP < 2.5s | `<link rel="preload" as="image">` for hero image |
| CLS < 0.1 | Set explicit `width`/`height` on all images |
| HTTPS + compression | `app.use(helmet()); app.use(compression())` |

## 7. On-Page SEO Rules

| Element | Rule |
|---|---|
| `<title>` | 50-60 chars; primary keyword near start; unique per page |
| `<meta description>` | 150-160 chars; include a CTA ("Learn more", "Get started") |
| `<h1>` | Exactly one per page; include primary keyword |
| URL structure | `/blog/seo-tips` not `/blog?id=42` |
| Heading hierarchy | H1 → H2 → H3; never skip levels |
| Internal links | Use descriptive anchor text; link to related pages |

## 8. Prerendering for Bots

Detect bots and serve pre-rendered HTML. Easiest: use prerender.io.

```bash
npm install prerender-node
```

```ts
import prerender from "prerender-node";
// Register before static file serving
app.use(prerender.set("prerenderToken", process.env.PRERENDER_TOKEN));
```

Self-hosted bot detection pattern:

```ts
const BOT_RE = /googlebot|bingbot|slurp|duckduckbot|yandex/i;
app.use(async (req, res, next) => {
  if (!BOT_RE.test(req.headers["user-agent"] ?? "")) return next();
  // Serve Puppeteer-rendered HTML cached in Redis (TTL 24h)
  next();
});
```

Alternative: `vite-plugin-ssg` for static pre-rendering at build time (best for mostly-static marketing sites).

## 9. Performance & Core Web Vitals

Core Web Vitals are a Google ranking signal.

| Metric | Target | Fix |
|---|---|---|
| LCP | < 2.5s | Preload hero, use CDN, compress images |
| INP | < 200ms | Break long tasks, reduce JS bundle |
| CLS | < 0.1 | Reserve space for images and embeds |

Vite code-splitting to reduce initial bundle:

```ts
// vite.config.ts
build: { rollupOptions: { output: {
  manualChunks: { vendor: ["react", "react-dom"], router: ["react-router-dom"] }
} } }
```

Measure: `npx unlighthouse --site https://yourapp.com` or Chrome Lighthouse.
