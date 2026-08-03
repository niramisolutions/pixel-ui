"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import ThreeCanvas from "@/components/three/Canvas";
import { THEME_COLORS } from "@/lib/three";
import { cn } from "@/lib/utils";

// Boxes per side — total box count is GRID_SIZE * GRID_SIZE. Keep this modest (each box is its
// own live object with a per-frame update and hover raycast — hundreds is fine, thousands will hang the tab).
const GRID_SIZE = 15;
// Distance between box centers — raise this to spread the same box count over a wider area.
const SPACING = 2.5;
// Edge length of each individual box.
const CUBE_SIZE = 2.0;
// Half the grid width, used to center the grid on (0, 0) — derived, don't edit directly.
const HALF = (GRID_SIZE - 1) / 2;
// Half-width of the whole grid in world units — feeds the ground grid size and particle spread.
const GRID_EXTENT = HALF * SPACING + SPACING * 0.6;
// How far (in world units, not CSS pixels — there's no fixed px-to-world ratio in a 3D perspective
// scene) the pop effect spreads from the hovered box. In units of SPACING, so it scales with the grid.
const HOVER_RADIUS = SPACING * 2.5;

// Primary neon color, used for box wireframe edges.
const ACCENT = new THREE.Color(THEME_COLORS.accent);
// Secondary neon color, used for the ground grid, corner markers, and particles.
const ACCENT_STRONG = new THREE.Color(THEME_COLORS.accentStrong);

// Computes the (x, z) world position of every box in the grid, once.
function useGridPositions() {
  return useMemo(() => {
    const cells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const x = (i - HALF) * SPACING;
        const z = (j - HALF) * SPACING;
        const dist = Math.hypot(x, z);
        cells.push({ x, z, dist, phase: dist * 0.55 });
      }
    }
    return cells;
  }, []);
}

// One wireframe box: dark fill + glowing edges. Pops up when it, or any box within HOVER_RADIUS
// of it, is hovered — closer boxes pop higher, via `hoverPointRef`, a ref shared by every Cube in the grid.
function Cube({ x, z, hoverPointRef }) {
  const group = useRef(); // the box's position/scale/rotation, mutated every frame
  const fillMaterial = useRef(); // the dark fill material, so we can fade it in on hover
  const edgeMaterial = useRef(); // the glowing edge material, so we can fade/brighten it on hover
  const pop = useRef(0); // 0 = resting (invisible), 1 = fully popped up (fully visible) — eases toward `target` each frame

  // Wireframe outline of the box, built once and reused (not part of the fill mesh).
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)), []);

  // Runs every rendered frame: checks distance to the shared hover point, eases the pop, applies it.
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const hp = hoverPointRef.current;
    // 1 when this box is exactly at the hovered point, fading to 0 at HOVER_RADIUS away, 0 if nothing is hovered.
    const target = hp ? Math.max(0, 1 - Math.hypot(x - hp.x, z - hp.z) / HOVER_RADIUS) : 0;
    pop.current += (target - pop.current) * 0.18; // spring-like ease toward the target

    group.current.position.y = 0.55 + pop.current * 1.2; // lifts up when popped
    group.current.scale.setScalar(1 + pop.current * 0.25); // grows slightly when popped
    // group.current.rotation.y = t * 0.12; // slow constant spin
    fillMaterial.current.opacity = pop.current; // invisible at rest, fully opaque (solid) once popped
    edgeMaterial.current.opacity = pop.current; // invisible at rest, fades in when popped
    edgeMaterial.current.color.copy(ACCENT).multiplyScalar(0.55 + pop.current * 2.5); // overdrives past 1.0 when popped, so Bloom picks it up as a glow
  });

  return (
    <group ref={group} position={[x, 0, z]}>
      {/* Solid box that catches pointer hover — dark fill matching the background, so only the edges read as neon. */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          hoverPointRef.current = { x, z };
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          hoverPointRef.current = null;
        }}
      >
        <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
        <meshBasicMaterial ref={fillMaterial} color={THEME_COLORS.ink} transparent opacity={0} />
      </mesh>
      {/* Glowing wireframe outline drawn on top of the fill. */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={edgeMaterial} color={ACCENT} transparent opacity={0} />
      </lineSegments>
    </group>
  );
}

// The faint floor grid sitting just beneath the boxes.
function GroundGrid() {
  const grid = useMemo(() => {
    const helper = new THREE.GridHelper(GRID_EXTENT * 2, GRID_SIZE + 1, ACCENT_STRONG, THEME_COLORS.inkDeep);
    helper.position.y = -CUBE_SIZE / 2 - 0.02;
    helper.material.transparent = true;
    helper.material.opacity = 0;
    return helper;
  }, []);

  return <primitive object={grid} />;
}

// A small glowing triangle marker on the floor beneath each box.
function Marker({ x, z }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, -CUBE_SIZE / 2 - 0.01, z]}>
      <circleGeometry args={[0.14, 3]} />
      <meshBasicMaterial color={ACCENT_STRONG} transparent opacity={0} />
    </mesh>
  );
}

// Deterministic PRNG (mulberry32) so particle placement stays pure across renders.
function createRandom(seed) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Drifting neon dust: a single Points cloud that rises and wraps back to the floor.
function Particles() {
  const pointsRef = useRef(); // the Points object, so the frame loop can reach its geometry
  const count = 340; // number of particles
  const radius = GRID_EXTENT + 2; // how far particles can spawn from center on x/z

  // Random (but seeded/deterministic) starting position and rise-speed per particle, computed once.
  const [positions, speeds] = useMemo(() => {
    const random = createRandom(1337);
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let k = 0; k < count; k++) {
      pos[k * 3] = (random() - 0.5) * radius * 2;
      pos[k * 3 + 1] = random() * 8 - 1;
      pos[k * 3 + 2] = (random() - 0.5) * radius * 2;
      spd[k] = 0.15 + random() * 0.4;
    }
    return [pos, spd];
  }, [count, radius]);

  // Every frame: nudge each particle upward by its own speed, wrap back down once it's too high.
  useFrame((_, delta) => {
    const attr = pointsRef.current.geometry.attributes.position;
    for (let k = 0; k < count; k++) {
      let y = attr.array[k * 3 + 1] + speeds[k] * delta;
      if (y > 7) y = -1;
      attr.array[k * 3 + 1] = y;
    }
    attr.needsUpdate = true; // tells three.js the GPU buffer must be re-uploaded
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={ACCENT_STRONG} size={0.06} transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}

// The full 3D scene: camera controls, fog, every box/marker, particles, and the bloom glow effect.
function Scene() {
  const cells = useGridPositions();
  // Shared by every Cube: null when nothing's hovered, else the (x, z) of the hovered box —
  // read by each Cube's useFrame to decide how much it should pop.
  const hoverPointRef = useRef(null);

  return (
    <>
      {/* Fades distant objects to black instead of a hard cutoff. */}
      <fogExp2 attach="fog" args={[THEME_COLORS.ink, 0.045]} />
      {/* Camera framing is fixed — dragging/zooming/rotating is disabled. */}
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        enableZoom={false}
        enableRotate={false}
        enablePan={false}
        maxPolarAngle={Math.PI * 0.49}
        target={[0, -2.5, 0]}
      />
      {cells.map((cell, index) => (
        <Cube key={index} x={cell.x} z={cell.z} hoverPointRef={hoverPointRef} />
      ))}
      <GroundGrid />
      {cells.map((cell, index) => (
        <Marker key={index} x={cell.x} z={cell.z} />
      ))}
      <Particles />
      {/* Post-processing pass that blooms/glows anything bright, giving the neon look. */}
      <EffectComposer>
        <Bloom intensity={1.4} luminanceThreshold={0} luminanceSmoothing={0.7} mipmapBlur />
      </EffectComposer>
    </>
  );
}

// Public component: fills its parent (must be a `relative` container) with the neon scene as a background layer.
export default function NeonCubeGridBackground({ className }) {
  return (
    <div
      className={cn("pointer-events-auto absolute inset-0", className)}
      style={{
        background: `radial-gradient(ellipse at 50% 42%, ${THEME_COLORS.inkDeep}22 0%, ${THEME_COLORS.ink} 70%)`,
      }}
    >
      <ThreeCanvas className="h-full w-full" camera={{ fov: 38, position: [11, 9.5, 11] }}>
        <Scene />
      </ThreeCanvas>
    </div>
  );
}
