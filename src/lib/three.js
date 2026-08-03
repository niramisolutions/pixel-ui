export const THEME_COLORS = {
  ink: "#081612",
  inkDeep: "#07423c",
  accent: "#c2f96a",
  accentMid: "#7be681",
  accentStrong: "#34d399",
  paper: "#fafafa",
  border: "#e8ecea",
};

export const DPR_RANGE = [1, 2];

// Cached, because this is read as a useSyncExternalStore snapshot: uncached it allocated a real
// WebGL context on every render of the provider wrapping the whole app, and never released one.
let webglSupport;

export function supportsWebGL() {
  if (typeof window === "undefined") return false;
  if (webglSupport !== undefined) return webglSupport;

  try {
    const canvas = document.createElement("canvas");
    const context =
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"));
    // Hand the probe context straight back, or it sits on the browser's small context budget
    // until GC — which the six canvases on this page are already competing for.
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    webglSupport = Boolean(context);
  } catch {
    webglSupport = false;
  }

  return webglSupport;
}

export function disposeObject3D(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value && typeof value.dispose === "function") value.dispose();
        });
        material.dispose();
      });
    }
  });
}
