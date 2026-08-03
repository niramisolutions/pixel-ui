"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useAnimationCapabilities } from "@/providers/AnimationProvider";
import { useInView } from "@/hooks/useInView";
import { DPR_RANGE } from "@/lib/three";
import { cn } from "@/lib/utils";

const DEFAULT_GL = { antialias: true, alpha: true, powerPreference: "high-performance" };

export default function ThreeCanvas({
  children,
  fallback = null,
  frameloop = "always",
  className,
  camera,
  dpr = DPR_RANGE,
  gl,
  ...props
}) {
  const { mounted, webglSupported, prefersReducedMotion } = useAnimationCapabilities();
  const [containerRef, inView, entered] = useInView();

  const mergedGl = useMemo(() => ({ ...DEFAULT_GL, ...gl }), [gl]);
  const mergedCamera = useMemo(() => ({ fov: 40, position: [0, 0, 6], ...camera }), [camera]);

  // The container always renders so the observer has something to watch; the context itself is
  // only created once the section is approached, and the loop parks when it leaves.
  const active = mounted && webglSupported && entered;

  return (
    <div ref={containerRef} className={cn("h-full w-full", className)}>
      {active ? (
        <Canvas
          className="touch-none"
          dpr={dpr}
          // "demand" still paints one frame, so a reduced-motion visitor gets a static scene
          // rather than an empty canvas; offscreen gets "never" because nothing can be seen.
          frameloop={prefersReducedMotion ? "demand" : inView ? frameloop : "never"}
          camera={mergedCamera}
          gl={mergedGl}
          {...props}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      ) : (
        fallback
      )}
    </div>
  );
}
