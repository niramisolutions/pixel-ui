# PixelUI

Marketing site for PixelUI — a single-page Next.js app presenting four service lines (AI Automation, Custom SaaS Development, Data Analytics, Managed IT Services), with animated 3D scenes rendered through React Three Fiber.

Built as a **static export**: `npm run build` emits a plain `out/` directory that can be served from any static host or CDN.

## Stack

|           |                                                                              |
| --------- | ---------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router), React 19 — JavaScript, no TypeScript                |
| Styling   | Tailwind CSS v4 (CSS-first config), PostCSS                                  |
| 3D        | three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing |
| Animation | GSAP + ScrollTrigger                                                         |
| Forms     | react-hook-form                                                              |
| Tooling   | ESLint (flat config), Prettier                                               |

## Getting started

Requires Node.js 20.9+ (Next.js 16 baseline; developed on Node 22).

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Dev server with Turbopack          |
| `npm run build`        | Production static export to `out/` |
| `npm start`            | Serve a previous build             |
| `npm run lint`         | ESLint                             |
| `npm run format`       | Prettier, write                    |
| `npm run format:check` | Prettier, check only               |

There is currently no test suite.

## Environment

| Variable               | Required              | Default                 | Purpose                                        |
| ---------------------- | --------------------- | ----------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | For production builds | `http://localhost:3000` | Canonical URLs, Open Graph tags, `sitemap.xml` |

This value is inlined at build time. A production build without it will publish `localhost` URLs in the sitemap and social metadata, so set it in the build environment rather than at runtime.

## Project layout

```
src/
  app/           routes — single page at /, plus robots, sitemap, not-found
  components/
    layout/      header, footer
    sections/    page sections, composed in app/page.js
    three/       WebGL building blocks (Canvas wrapper, scenes)
    ui/          reusable primitives
  constants/     navigation, contact/social links, SEO defaults
  hooks/         intersection observer, media query, magnetic cursor
  lib/           gsap + three setup, class merging, metadata builders
  providers/     AnimationProvider (motion & WebGL capability context)
  styles/        design tokens, typography scale, keyframes
public/          images, video, optimized .glb models
models-src/      pristine 3D source exports (build input, not shipped)
scripts/         model optimization pipeline
```

`@/*` resolves to `src/*`.

Styling tokens live in CSS, not a `tailwind.config` file — see [src/styles/variables.css](src/styles/variables.css) for the `@theme` block and custom gradient utilities.

## 3D models

`public/models/*.glb` is generated, not hand-edited. The sources in `models-src/` are optimized into it:

```bash
node scripts/optimize-models.mjs              # lossless: compression only (default)
node scripts/optimize-models.mjs --aggressive # also simplifies geometry — visibly lossy
```

The lossless pass is what ships. The aggressive pass reaches a far smaller payload but noticeably alters at least one model, so it is opt-in. [scripts/optimize-models.mjs](scripts/optimize-models.mjs) documents the per-model settings and the reasoning behind them.

Scenes are deliberately expensive to mount, so rendering is gated on three conditions: WebGL support, `prefers-reduced-motion`, and proximity to the viewport. A canvas is not created until the user scrolls near it, and its frame loop parks when it scrolls away. New 3D work should go through the shared `ThreeCanvas` wrapper rather than mounting `<Canvas>` directly.

Note: `models-src/ai-automation.glb` is 99 MiB, just under GitHub's 100 MiB per-file limit. A heavier re-export will be rejected on push.

## Deployment

`npm run build` produces a fully static `out/`. Deploy that directory to any static host (Vercel, Netlify, S3/CloudFront, GitHub Pages). Set `NEXT_PUBLIC_SITE_URL` in the build environment first.

Because the site is statically exported, there is no server runtime — no API routes, server actions, or middleware — and `next/image` optimization is disabled, so images must be exported at their display size.

## Current limitations

- **The contact form does not send anything.** It validates input and shows a confirmation panel, but submissions go nowhere. Wiring it up needs an external form service or a hosted endpoint, since the static export has no server.
- **Service cards show static artwork.** The per-card GLB viewers are implemented but commented out in [src/components/sections/ServiceCard.jsx](src/components/sections/ServiceCard.jsx); restore instructions are inline.
- **Social links and contact details are placeholders** ([src/constants/links.js](src/constants/links.js)) and point at bare `linkedin.com` / `github.com` / `x.com`.
- The model optimization script depends on several `@gltf-transform/*` packages and `meshoptimizer` that are not declared in `package.json` — they currently resolve transitively through `@gltf-transform/cli`.
