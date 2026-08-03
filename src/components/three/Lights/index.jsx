import { THEME_COLORS } from "@/lib/three";

export default function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} color={THEME_COLORS.paper} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} color={THEME_COLORS.paper} />
      <pointLight position={[-4, -2, 3]} intensity={0.8} color={THEME_COLORS.accent} />
    </>
  );
}
