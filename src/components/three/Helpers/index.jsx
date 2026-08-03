"use client";

import { Html, useProgress } from "@react-three/drei";

export function Loader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <span className="flex items-center gap-2 text-xs font-medium text-ink/60">
        <span className="size-3 animate-spin rounded-full border-2 border-border border-t-ink" />
        {Math.round(progress)}%
      </span>
    </Html>
  );
}
