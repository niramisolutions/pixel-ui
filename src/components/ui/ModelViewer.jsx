"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Center, Environment, useGLTF } from "@react-three/drei";
import { MathUtils } from "three";
import ThreeCanvas from "@/components/three/Canvas";

// defaults, in plain units instead of hunting radians/world-space values; override per-model via props
const DEFAULT_POSITION = [0, 0, 0.9]; // [x, y, z]
const DEFAULT_TILT_DEG = [20, 10, 10]; // [pitch, yaw, roll] in degrees, corrects the upward tilt
const DEFAULT_SCALE = 1;
const DEFAULT_SWAY_SPEED = 0.6;
const DEFAULT_SWAY_AMPLITUDE_DEG = 20; // max sway either side of the base yaw, keeps the backside out of view

function Model({ src, position, tiltDeg, scale, swaySpeed, swayAmplitudeDeg }) {
  // useDraco false: the models ship with EXT_meshopt_compression, whose decoder drei bundles.
  // Leaving it on constructed a DRACOLoader pointed at a Google CDN for no reason.
  const { scene } = useGLTF(src, false);
  const group = useRef(null);

  const rotation = useMemo(() => tiltDeg.map(MathUtils.degToRad), [tiltDeg]);
  const baseYaw = rotation[1];
  const swayAmplitude = MathUtils.degToRad(swayAmplitudeDeg);

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y =
        baseYaw + Math.sin(clock.elapsedTime * swaySpeed) * swayAmplitude;
    }
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

// alpha keeps the canvas background transparent so it blends over the card
const MODEL_GL = { alpha: true, antialias: true };
const MODEL_CAMERA = { position: [0, 0, 2], fov: 40 };

export default function ModelViewer({
  src,
  className,
  position = DEFAULT_POSITION,
  tiltDeg = DEFAULT_TILT_DEG,
  scale = DEFAULT_SCALE,
  swaySpeed = DEFAULT_SWAY_SPEED,
  swayAmplitudeDeg = DEFAULT_SWAY_AMPLITUDE_DEG,
}) {
  return (
    <ThreeCanvas className={className} camera={MODEL_CAMERA} gl={MODEL_GL}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} />
      <Environment preset="city" />
      <Model
        src={src}
        position={position}
        tiltDeg={tiltDeg}
        scale={scale}
        swaySpeed={swaySpeed}
        swayAmplitudeDeg={swayAmplitudeDeg}
      />
    </ThreeCanvas>
  );
}
