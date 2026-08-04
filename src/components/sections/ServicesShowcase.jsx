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
// Layout falls back to a static grid below `xl` and whenever the visitor asks for reduced
// motion — one column on phones, 2x2 from `md` up — and the `motion-safe:xl:` variants below
// are deliberately kept in sync with the gsap.matchMedia query.
//
// The pinned row starts at `xl` (1280px), not `md`. Four cards across a tablet leave each one
// 180px (768px portrait) to 238px (1024px landscape) wide: the titles wrap to two lines, the
// descriptions run seven, and the art shrinks below the point where it reads. The 2x2 grid
// gives the same card 330px at 768px and 434px at 1024px.
//
// Sized so all `services.length` cards sit side by side within the viewport from the start —
// 4.5rem is 3 gaps (gap-6) between 4 cards, 4rem is a 2rem gutter each side so the outer two
// cards don't sit flush against the edges (`overflow-x-clip` on the parent was shaving their
// border gradient off at every width from 1280 up to ~1500). Clamped so it never shrinks below
// a usable floor on narrow triggers or balloons past a sane max on ultrawide screens.
const CARD_WIDTH = "clamp(9rem, calc((100vw - 4.5rem - 4rem) / 4), 22rem)";

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
            "(min-width: 1280px) and (prefers-reduced-motion: no-preference)",
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
                  {
                    autoAlpha: 1,
                    scale: 1,
                    xPercent: 0,
                    duration: 0.7,
                    ease: "power2.out",
                  },
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
      className="motion-safe:xl:h-[calc(var(--service-steps)*100vh)]"
    >
      <div className="flex flex-col gap-14 py-24 motion-safe:xl:sticky motion-safe:xl:top-0 motion-safe:xl:h-screen motion-safe:xl:justify-center motion-safe:xl:py-0">
        <div className="mx-auto w-full max-w-6xl px-6 md:px-10 lg:px-16">
          {children}
        </div>

        {/* clips the track where it runs past the viewport, so the page gains no sideways scroll */}
        <div className="w-full overflow-x-clip">
          <div
            ref={trackRef}
            className="mx-auto grid w-full max-w-6xl gap-6 px-6 md:grid-cols-2 md:gap-7 md:px-10 lg:px-16 motion-safe:xl:flex motion-safe:xl:w-max motion-safe:xl:max-w-none motion-safe:xl:px-0"
          >
            {services.map((service) => (
              <div
                key={service.title}
                className="motion-safe:xl:shrink-0"
                style={{ "--card-w": CARD_WIDTH }}
              >
                <div className="h-full motion-safe:xl:w-[var(--card-w)]">
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
