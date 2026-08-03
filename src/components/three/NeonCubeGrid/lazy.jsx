"use client";

import { lazy, Suspense } from "react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

// Client boundary for the lazy load: `ssr: false` is not permitted inside a Server Component,
// and Process/CTASection are both server-rendered.
//
// React.lazy rather than next/dynamic on purpose. next/dynamic registers a client reference
// that Next preloads during initial page load, which had the 97KB @react-three/postprocessing
// chunk downloading on every visit even when nothing rendered it. React.lazy starts its import
// only when the component is actually rendered, which here is gated on the observer below.
const NeonCubeGrid = lazy(() => import("@/components/three/NeonCubeGrid"));

// Positioning shell only — deliberately no background. NeonCubeGridBackground paints its own
// radial gradient, and painting it here too would stack two translucent layers and lighten the
// centre of the section.
export default function NeonCubeGridBackgroundLazy({ className }) {
  const [ref, , entered] = useInView({ rootMargin: "300px" });

  return (
    <div ref={ref} className={cn("absolute inset-0", className)}>
      {entered ? (
        <Suspense fallback={null}>
          <NeonCubeGrid />
        </Suspense>
      ) : null}
    </div>
  );
}
