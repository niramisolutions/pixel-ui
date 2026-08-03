"use client";

import { lazy, Suspense } from "react";
import Image from "next/image";
import { useInView } from "@/hooks/useInView";

// React.lazy behind an observer rather than next/dynamic, so three is fetched only for the
// cards a visitor actually reaches — next/dynamic would pre-download it on every page load.
const ModelViewer = lazy(() => import("@/components/ui/ModelViewer"));

function LazyModel({ src, config }) {
  const [ref, , entered] = useInView({ rootMargin: "300px" });

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl"
    >
      {entered ? (
        <Suspense fallback={null}>
          <ModelViewer src={src} className="h-full w-full" {...config} />
        </Suspense>
      ) : null}
    </div>
  );
}

// Stacked rather than the previous side-by-side split. The old layout gave the copy and the
// art a flex-1 each, so at the card's ~544px both got ~250px: the description ran narrow and
// the longer deliverables broke across two lines mid-phrase. Art now spans the full width as
// a banner and the deliverables run in two columns, which fits every label on one line.
export default function ServiceCard({ service }) {
  return (
    <div className="group relative h-full rounded-3xl p-2 border-gradient-accent shadow-[0px_2px_2px_0px_rgba(0,0,0,0.1)]">
      <div className="relative z-10 flex h-full flex-col gap-4 rounded-2xl border border-accent p-4 shadow-[inset_0px_2px_0px_0px_var(--color-accent)]">
        {/* 3D model parked in favour of static art — restore this line and drop the banner
            below to bring the GLB viewers back:
        {service.model && <LazyModel src={service.model} config={service.modelConfig} />}
        */}

        {/* object-contain: the four pieces run from 0.76 to 1.50 aspect, so a fixed crop would
            cut the subject out of the portrait one. The radial pool gives the transparent PNGs
            something to sit on instead of floating on flat ink. */}
        <div className="relative aspect-16/9 w-full overflow-hidden rounded-xl bg-[radial-gradient(65%_70%_at_50%_58%,rgba(194,249,106,0.15),transparent_72%)]">
          <Image
            src={service.image}
            alt={`${service.title} illustration`}
            fill
            sizes="(min-width: 768px) 26rem, 90vw"
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-card-title text-paper">{service.title}</h3>
          <p className="text-[14px] leading-5 text-paper/70">
            {service.description}
          </p>
        </div>

        {/* mt-auto keeps the rule and deliverables on the same baseline across all four cards,
            which otherwise drift apart because the descriptions differ in length */}
        <ul className="mt-auto grid grid-cols-1 gap-x-3 gap-y-1.5 border-t border-accent/25 pt-3.5 sm:grid-cols-2">
          {service.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-1.5 text-[12px] leading-snug text-paper/65"
            >
              <span
                className="mt-1.5 size-1 shrink-0 rounded-full bg-accent/80"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
