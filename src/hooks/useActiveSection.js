"use client";

import { useEffect, useState } from "react";

// Returns the id of the section currently under the header, or null while the hero is in view.
//
// The rootMargin collapses the observer root to a thin band just below the header rather than
// the whole viewport. Without it every tall section counts as visible at once — Services alone
// is four viewports tall — and the highlight would flicker between two links while scrolling.
//
// `ids` must be a stable array; define it at module scope.
export function useActiveSection(ids) {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            return;
          }
        }
        // nothing in the band: either the hero is on screen, or we are between sections.
        // Only fall back to null at the very top, so the last match sticks otherwise.
        if (window.scrollY < window.innerHeight * 0.5) setActiveId(null);
      },
      { rootMargin: "-25% 0px -70% 0px" },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}
