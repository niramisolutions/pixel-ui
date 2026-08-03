"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import ThreeCanvas from "@/components/three/Canvas";
import { THEME_COLORS } from "@/lib/three";
import { cn } from "@/lib/utils";

// Displaces the plane's vertices along z as two offset sine waves, so it reads as water
// rippling rather than a single uniform swell.
const VERTEX_SHADER = `
  uniform float uTime;
  varying float vElevation;

  void main() {
    vec3 pos = position;
    float elevation = sin(pos.x * 1.6 + uTime) * 0.28 + sin(pos.y * 2.2 - uTime * 0.8) * 0.16;
    pos.z += elevation;
    vElevation = elevation;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Tints wave crests toward the brand accent so the ripple stays visible without a light source.
const FRAGMENT_SHADER = `
  uniform vec3 uColorBase;
  uniform vec3 uColorCrest;
  varying float vElevation;

  void main() {
    float mixStrength = smoothstep(-0.3, 0.3, vElevation) * 0.4;
    gl_FragColor = vec4(mix(uColorBase, uColorCrest, mixStrength), 1.0);
  }
`;

function WavePlane() {
  const materialRef = useRef();
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorBase: { value: new THREE.Color(THEME_COLORS.paper) },
      uColorCrest: { value: new THREE.Color(THEME_COLORS.accentMid) },
    }),
    [],
  );

  useFrame(({ clock }) => {
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh>
      {/* Oversized relative to the viewport so displaced edges never reveal a gap. */}
      <planeGeometry args={[viewport.width * 1.3, viewport.height * 1.3, 48, 48]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// Fills its parent (must be `relative`) with an animated wavy plate. Falls through to the
// parent's own background when WebGL is unavailable or the user prefers reduced motion.
export default function WaveCardBackground({ className }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <ThreeCanvas className="h-full w-full" camera={{ fov: 45, position: [0, 0, 4] }}>
        <WavePlane />
      </ThreeCanvas>
    </div>
  );
}
