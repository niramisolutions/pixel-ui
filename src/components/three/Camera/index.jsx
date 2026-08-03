"use client";

import { PerspectiveCamera } from "@react-three/drei";

export default function Camera({ position = [0, 0, 6], fov = 40, ...props }) {
  return <PerspectiveCamera makeDefault position={position} fov={fov} {...props} />;
}
