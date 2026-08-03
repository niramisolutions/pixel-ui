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
//
// Sized so all `services.length` cards sit side by side within the viewport from the start —
// 4.5rem is 3 gaps (gap-6) between 4 cards. Clamped so it never shrinks below a usable floor
// on narrow triggers or balloons past a sane max on ultrawide screens.
const CARD_WIDTH = "clamp(9rem, calc((100vw - 4.5rem) / 4), 22rem)";

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

        import("@/lib/gsap").then(({ gsap }) => {
          if (cancelled) return;

          const mm = gsap.matchMedia();

          mm.add(
            "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
            () => {
              const cards = Array.from(track.children);
              if (cards.length === 0) return;

              // Cards are sized (via CARD_WIDTH) to already sit side by side within the
              // viewport, so the track never needs to slide horizontally — nothing carries an
              // earlier card out of view when a later one arrives. Each card instead slides in
              // right-to-left on its own, into its final resting slot in the row.
              gsap.set(cards, { autoAlpha: 0, scale: 0.92, xPercent: 100 });

              const timeline = gsap.timeline({
                scrollTrigger: {
                  trigger: wrapper,
                  start: "top top",
                  end: "bottom bottom",
                  scrub: 0.8,
                  invalidateOnRefresh: true,
                },
              });

              cards.forEach((card, i) => {
                timeline.to(
                  card,
                  { autoAlpha: 1, scale: 1, xPercent: 0, duration: 0.7, ease: "power2.out" },
                  i,
                );
              });
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
                style={{ "--card-w": CARD_WIDTH }}
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
