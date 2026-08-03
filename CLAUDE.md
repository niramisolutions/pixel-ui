# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # dev server (Turbopack) on :3000
npm run build          # static export -> out/
npm run lint           # eslint (flat config, next/core-web-vitals + prettier)
npm run format         # prettier --write .
npm run format:check   # prettier --check .

node scripts/optimize-models.mjs              # models-src/*.glb -> public/models/*.glb (lossless)
node scripts/optimize-models.mjs --aggressive # additionally simplifies geometry; visibly lossy
```

There is no test suite and no test runner configured.

## Architecture

Single-page marketing site for PixelUI. Next.js App Router, JavaScript (no TypeScript), Tailwind v4, React Three Fiber. All content lives at `/` — [src/app/page.js](src/app/page.js) stacks the section components in order; there are no other routes besides `robots.js`, `sitemap.js`, and `not-found.js`.

`@/*` maps to `src/*` ([jsconfig.json](jsconfig.json)).

### Static export is the binding constraint

[next.config.mjs](next.config.mjs) sets `output: "export"`, so the build emits a static `out/`. No server actions, no route handlers, no middleware, no SSR at request time, and `images.unoptimized` is on (so `next/image` does no resizing — ship correctly-sized assets). Anything needing a server has to go to an external service.

`SITE_URL` comes from `NEXT_PUBLIC_SITE_URL` and falls back to `http://localhost:3000` ([src/constants/seo.js](src/constants/seo.js)) — it is baked in at build time and feeds canonical URLs, OG tags, and the sitemap, so a production build without it emits localhost URLs.

### WebGL gating — three layers, all deliberate

The page can mount six WebGL canvases, so nothing three-related renders unconditionally. Understanding this requires reading the layers together:

1. **Capability** — [AnimationProvider](src/providers/AnimationProvider.jsx) wraps the whole tree and publishes `mounted`, `prefersReducedMotion`, and `webglSupported` via `useSyncExternalStore`. `supportsWebGL()` in [src/lib/three.js](src/lib/three.js) is cached and explicitly frees its probe context — uncached it leaked a real GL context per provider render.
2. **Proximity** — [useInView](src/hooks/useInView.js) returns `[ref, inView, entered]`. `entered` latches on first approach and gates _mounting_ a GL context; `inView` tracks live visibility and gates the _frame loop_. Both matter: an offscreen canvas keeps its compiled programs but stops costing GPU time.
3. **Frameloop** — [ThreeCanvas](src/components/three/Canvas/index.jsx) is the shared wrapper. The container div always renders (the observer needs a target), the `<Canvas>` only once `mounted && webglSupported && entered`, and `frameloop` resolves to `demand` under reduced motion, `never` when offscreen, otherwise `always`.

Route new 3D work through `ThreeCanvas` rather than mounting `<Canvas>` directly.

**Use `React.lazy`, not `next/dynamic`, for three.js chunks.** `next/dynamic` registers a client reference that Next preloads on initial page load, which pulled the 97KB postprocessing chunk onto every visit even when nothing rendered it. `React.lazy` only imports when actually rendered, which here is gated behind the observer. See [NeonCubeGrid/lazy.jsx](src/components/three/NeonCubeGrid/lazy.jsx) and the `LazyModel` wrapper in [ServiceCard.jsx](src/components/sections/ServiceCard.jsx). The `lazy.jsx` sibling pattern exists because `ssr: false` is illegal inside a Server Component and several sections are server-rendered.

Most sections are Server Components; only components that need hooks carry `"use client"`.

### 3D model pipeline

`models-src/` holds pristine exports (155 MB, not shipped). [scripts/optimize-models.mjs](scripts/optimize-models.mjs) rebuilds `public/models/` from them; only `public/models/` reaches the browser. The script's header comments explain the non-obvious choices (Meshopt over Draco so drei's bundled decoder is used and no Google CDN fetch happens; dropping NORMAL before welding so the simplifier can collapse split-vertex seams).

Two gotchas:

- The script imports `@gltf-transform/core`, `/extensions`, `/functions`, and `meshoptimizer`, but package.json only declares `@gltf-transform/cli`. They currently resolve transitively — a dependency bump can break the script without touching it.
- Per-model `scale` values in [Services.jsx](src/components/sections/Services.jsx) are derived from each GLB's own world-space extents and are annotated with them. Re-derive the scale whenever a model is swapped.

### Styling

Tailwind v4, CSS-first config. [src/app/globals.css](src/app/globals.css) imports three files under `src/styles/`: `variables.css` (the `@theme` token block plus custom `@utility` gradients and `--header-h` / `--hero-chrome` layout constants), `typography.css`, and `animations.css`. Tokens are defined in CSS, not in a `tailwind.config` file.

The typography utilities are named `text-display`, `text-section-title`, `text-section-subtitle`, `text-lead`, `text-card-title`. tailwind-merge would otherwise read those as text-_color_ utilities and silently drop them when merged against `text-ink`, so [src/lib/utils.js](src/lib/utils.js) registers them as font-size utilities in `cn()`. **Adding a new `text-*` typography utility requires adding its name to that list too.**

### Known stubs

- The contact form ([ContactSection.jsx](src/components/sections/ContactSection.jsx)) validates with react-hook-form and shows a confirmation panel but delivers nowhere. Under static export it needs an external form backend.
- Service cards render static art; the GLB viewers are commented out in [ServiceCard.jsx](src/components/sections/ServiceCard.jsx) with restore instructions inline.

## Repository hygiene

`node_modules/` and `.next/` were committed early on and later untracked; the history rewrite that removed them is done, but avoid re-adding them. `models-src/ai-automation.glb` is 99.0 MiB — about 1 MiB under GitHub's hard 100 MiB per-file limit — so a slightly heavier re-export will be rejected at push time.
