"use client";

import { useEffect, useRef, useState } from "react";

// Tracks whether an element is near the viewport. `entered` latches on first approach and is
// what gates mounting a WebGL context; `inView` tracks live visibility and is what gates the
// frame loop, so an offscreen canvas keeps its compiled programs but stops costing GPU time.
export function useInView({ rootMargin = "200px" } = {}) {
  const ref = useRef(null);
  const [state, setState] = useState({ inView: false, entered: false });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setState((previous) =>
          previous.inView === entry.isIntersecting && previous.entered
            ? previous
            : { inView: entry.isIntersecting, entered: previous.entered || entry.isIntersecting },
        );
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, state.inView, state.entered];
}
