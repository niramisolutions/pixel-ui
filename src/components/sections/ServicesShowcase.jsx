"use client";

import { useEffect, useRef } from "react";
import ServiceCard from "@/components/sections/ServiceCard";

// Scroll distance the pinned sequence consumes, per card. The tall outer wrapper is sized in
// CSS from `--service-steps`, so the page height never changes at runtime.
//
// Deliberately CSS `position: sticky` rather than ScrollTrigger's `pin: true`. A pin injects a
// spacer element the moment the trigger is created, which grows the document by the full pin
// distance and registers as a layout shift. Sticky reserves that height from the first paint.
//
// Layout falls back to the original two-column grid below `md` and whenever the visitor asks
// for reduced motion — the `motion-safe:md:` variants below and the gsap.matchMedia query are
// deliberately kept in sync.
const CARDS_VISIBLE_AT_ONCE_WIDTH = "min(26rem,80vw)";

export default function ServicesShowcase({ services, children }) {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    let cancelled = false;
    let revert;

    // gsap only loads once the section is approached, and only on screens that will use it.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        import("@/lib/gsap").then(({ gsap, ScrollTrigger }) => {
          if (cancelled) return;

          const mm = gsap.matchMedia();

          mm.add(
            "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
            () => {
              const cards = Array.from(track.children);
              if (cards.length === 0) return;

              // Measured rather than computed from the class list, so changing the card width
              // or gap needs no matching change here.
              const metrics = { start: 0, step: 0 };
              const measure = () => {
                gsap.set(track, { x: 0 });
                const first = cards[0].getBoundingClientRect();
                const second = cards[1]?.getBoundingClientRect();
                metrics.step = second ? second.left - first.left : first.width;
                // x that puts the first card in the middle of the viewport
                metrics.start = (window.innerWidth - first.width) / 2 - first.left;
              };

              measure();
              ScrollTrigger.addEventListener("refreshInit", measure);

              const xForCard = (index) => () => metrics.start - index * metrics.step;

              gsap.set(track, { x: metrics.start });
              gsap.set(cards, { autoAlpha: 0, scale: 0.92 });

              const timeline = gsap.timeline({
                scrollTrigger: {
                  trigger: wrapper,
                  start: "top top",
                  end: "bottom bottom",
                  scrub: 0.8,
                  invalidateOnRefresh: true,
                },
              });

              // First card arrives in the middle before anything starts moving.
              timeline.to(
                cards[0],
                { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power2.out" },
                0,
              );

              for (let i = 1; i < cards.length; i++) {
                const at = 0.7 + (i - 1);
                // the track slides one card-width left...
                timeline.to(track, { x: xForCard(i), duration: 1, ease: "none" }, at);
                // ...and the next card fades up once that slide has opened room for it
                timeline.to(
                  cards[i],
                  { autoAlpha: 1, scale: 1, duration: 0.65, ease: "power2.out" },
                  at + 0.25,
                );
              }

              return () => ScrollTrigger.removeEventListener("refreshInit", measure);
            },
          );

          revert = () => mm.revert();
        });
      },
      { rootMargin: "600px" },
    );

    observer.observe(wrapper);

    return () => {
      cancelled = true;
      observer.disconnect();
      revert?.();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{ "--service-steps": services.length }}
      className="motion-safe:md:h-[calc(var(--service-steps)*100vh)]"
    >
      <div className="flex flex-col gap-14 py-24 motion-safe:md:sticky motion-safe:md:top-0 motion-safe:md:h-screen motion-safe:md:justify-center motion-safe:md:py-0">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-16">{children}</div>

        {/* clips the track where it runs past the viewport, so the page gains no sideways scroll */}
        <div className="w-full overflow-x-clip">
          <div
            ref={trackRef}
            className="mx-auto grid w-full max-w-6xl gap-6 px-6 md:grid-cols-2 lg:px-16 motion-safe:md:flex motion-safe:md:w-max motion-safe:md:max-w-none motion-safe:md:px-0"
          >
            {services.map((service) => (
              <div
                key={service.title}
                className="motion-safe:md:shrink-0"
                style={{ "--card-w": CARDS_VISIBLE_AT_ONCE_WIDTH }}
              >
                <div className="h-full motion-safe:md:w-[var(--card-w)]">
                  <ServiceCard service={service} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
