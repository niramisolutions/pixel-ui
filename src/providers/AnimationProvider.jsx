"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { supportsWebGL } from "@/lib/three";

const noopSubscribe = () => () => {};

const AnimationCapabilitiesContext = createContext({
  mounted: false,
  prefersReducedMotion: false,
  webglSupported: false,
});

export function AnimationProvider({ children }) {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const webglSupported = useSyncExternalStore(noopSubscribe, supportsWebGL, () => false);

  // This provider wraps the entire tree; an inline object would give every consumer a new
  // reference on each render and defeat their memoization.
  const value = useMemo(
    () => ({ mounted, prefersReducedMotion, webglSupported }),
    [mounted, prefersReducedMotion, webglSupported],
  );

  return (
    <AnimationCapabilitiesContext.Provider value={value}>
      {children}
    </AnimationCapabilitiesContext.Provider>
  );
}

export function useAnimationCapabilities() {
  return useContext(AnimationCapabilitiesContext);
}
