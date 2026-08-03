/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  experimental: {
    // Rewrites barrel imports to deep paths. lucide-react is the one that matters here: ten
    // files import from it and the barrel re-exports the entire icon set.
    optimizePackageImports: ["lucide-react", "@react-three/drei"],
  },
};

export default nextConfig;
