"use client";

import { useEffect, useRef } from "react";

// Same GSAP quickTo / elastic-return effect as before. The only change is that gsap is imported
// inside the effect rather than at module scope: the header is the sole above-the-fold gsap
// consumer, and a static import put the whole library in the initial bundle. The listeners
// attach a moment after hydration, which is still long before a pointer can reach the button.
export function useMagnetic(strength = 0.35) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let cancelled = false;
    let detach;

    import("@/lib/gsap").then(({ gsap }) => {
      if (cancelled) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

      let restRect = el.getBoundingClientRect();

      const handleEnter = () => {
        restRect = el.getBoundingClientRect();
      };

      const handleMove = (event) => {
        const relX = event.clientX - (restRect.left + restRect.width / 2);
        const relY = event.clientY - (restRect.top + restRect.height / 2);
        xTo(relX * strength);
        yTo(relY * strength);
      };

      const handleLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      };

      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mousemove", handleMove);
      el.addEventListener("mouseleave", handleLeave);

      detach = () => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mousemove", handleMove);
        el.removeEventListener("mouseleave", handleLeave);
        gsap.set(el, { x: 0, y: 0 });
      };
    });

    return () => {
      cancelled = true;
      detach?.();
    };
  }, [strength]);

  return ref;
}
