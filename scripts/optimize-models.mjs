// Rebuilds public/models/*.glb from the pristine originals in models-src/.
//
// Meshopt rather than Draco: drei bundles the Meshopt decoder, whereas Draco would cost an
// extra WASM fetch from a Google CDN on first model load.
//
// The non-obvious step is dropping NORMAL before welding. These exports carry split vertices
// (2.1M verts for 2.5M tris), and meshoptimizer cannot collapse an edge across a split, so
// simplification stalled at 84% no matter how loose the error budget was. Welding on position
// alone merges those seams; normals are regenerated afterwards from the simplified topology.
import { statSync } from "node:fs";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup, prune, weld, simplify, join, flatten, resample,
  quantize, textureCompress, palette, sparse,
} from "@gltf-transform/functions";
import { MeshoptSimplifier, MeshoptEncoder } from "meshoptimizer";
import { EXTMeshoptCompression } from "@gltf-transform/extensions";
import sharp from "sharp";

// Default is LOSSLESS: compression only, so every model renders exactly as authored.
// `node scripts/optimize-models.mjs --aggressive` additionally simplifies geometry and bakes
// uniform textures into material factors. That reaches 2.1MB instead of 39MB but is visibly
// different on custom-saas (the side monitors' screen content changes), so it is opt-in.
const AGGRESSIVE = process.argv.includes("--aggressive");

const LOSSLESS_MODELS = [
  { file: "ai-automation.glb", skipGeometry: true },
  { file: "custom-saas.glb", skipGeometry: true },
  { file: "data-analytics.glb", skipGeometry: true },
  { file: "managed-it.glb", skipGeometry: true },
];

const AGGRESSIVE_MODELS = [
  // ratio is the target; error is what actually binds. These render as small, rotating,
  // partly-occluded card backgrounds, so a loose error budget is imperceptible.
  //
  // ai-automation carries a per-triangle UV unwrap (2.08M unique UVs over 1.27M unique
  // positions), which splits the mesh into islands the simplifier cannot collapse across —
  // it stalled at 414k tris regardless of error budget. Both of its textures turned out to
  // be featureless: a flat green gradient, and a 4096x4096 metallicRoughness map whose
  // roughness channel has a standard deviation of zero. Baking them to scalar factors drops
  // the UVs, heals the seams, and looks the same.
  { file: "ai-automation.glb",  ratio: 0.015, error: 0.05, dropNormals: true, bakeFlatTextures: true },
  { file: "custom-saas.glb",    ratio: 0.06,  error: 0.04, dropNormals: true },
  { file: "data-analytics.glb", ratio: 0.5,   error: 0.01, dropNormals: false },
  // 5 animations on a rigged hierarchy — flatten/join/simplify would break the node graph.
  { file: "managed-it.glb",     skipGeometry: true },
];

const MODELS = AGGRESSIVE ? AGGRESSIVE_MODELS : LOSSLESS_MODELS;

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

// Averages an image in linear space (averaging sRGB bytes directly would skew the result).
async function averageLinear(buf, { srgb }) {
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const sums = [0, 0, 0];
  const pixels = info.width * info.height;
  for (let i = 0; i < data.length; i += ch) {
    for (let k = 0; k < 3; k++) {
      const v = data[i + k] / 255;
      sums[k] += srgb ? srgbToLinear(v) : v;
    }
  }
  return sums.map((s) => s / pixels);
}

// Replaces uniform baseColor / metallicRoughness maps with equivalent scalar factors, so the
// UV set they justify can be deleted.
async function bakeFlatTextures(doc) {
  for (const mat of doc.getRoot().listMaterials()) {
    const base = mat.getBaseColorTexture();
    if (base) {
      const [r, g, b] = await averageLinear(Buffer.from(base.getImage()), { srgb: true });
      const alpha = mat.getBaseColorFactor()[3];
      mat.setBaseColorFactor([r, g, b, alpha]).setBaseColorTexture(null);
    }
    const mr = mat.getMetallicRoughnessTexture();
    if (mr) {
      // glTF packs roughness in G and metallic in B, both linear.
      const [, roughness, metallic] = await averageLinear(Buffer.from(mr.getImage()), { srgb: false });
      mat.setRoughnessFactor(roughness * mat.getRoughnessFactor())
        .setMetallicFactor(metallic * mat.getMetallicFactor())
        .setMetallicRoughnessTexture(null);
    }
  }
}

// meshoptimizer needs welded topology to collapse edges; normals are rebuilt from the result.
function regenerateNormals(doc) {
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute("POSITION");
      const idx = prim.getIndices();
      if (!pos || !idx) continue;

      const p = pos.getArray();
      const ix = idx.getArray();
      const n = new Float32Array(p.length);

      for (let i = 0; i < ix.length; i += 3) {
        const a = ix[i] * 3, b = ix[i + 1] * 3, c = ix[i + 2] * 3;
        const ax = p[a], ay = p[a + 1], az = p[a + 2];
        const e1x = p[b] - ax, e1y = p[b + 1] - ay, e1z = p[b + 2] - az;
        const e2x = p[c] - ax, e2y = p[c + 1] - ay, e2z = p[c + 2] - az;
        const nx = e1y * e2z - e1z * e2y;
        const ny = e1z * e2x - e1x * e2z;
        const nz = e1x * e2y - e1y * e2x;
        n[a] += nx; n[a + 1] += ny; n[a + 2] += nz;
        n[b] += nx; n[b + 1] += ny; n[b + 2] += nz;
        n[c] += nx; n[c + 1] += ny; n[c + 2] += nz;
      }
      for (let i = 0; i < n.length; i += 3) {
        const len = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
        n[i] /= len; n[i + 1] /= len; n[i + 2] /= len;
      }

      const accessor = doc.createAccessor()
        .setType("VEC3")
        .setArray(n)
        .setBuffer(doc.getRoot().listBuffers()[0]);
      prim.setAttribute("NORMAL", accessor);
    }
  }
}

const countTris = (doc) =>
  doc.getRoot().listMeshes().reduce((total, mesh) =>
    total + mesh.listPrimitives().reduce((sub, prim) => {
      const idx = prim.getIndices();
      return sub + (idx ? idx.getCount() / 3 : 0);
    }, 0), 0);

await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "meshopt.decoder": MeshoptEncoder,
  "meshopt.encoder": MeshoptEncoder,
});

for (const cfg of MODELS) {
  const src = `models-src/${cfg.file}`;
  const dst = `public/models/${cfg.file}`;
  const doc = await io.read(src);
  const before = countTris(doc);

  const steps = [dedup(), resample()];

  if (!cfg.skipGeometry) {
    steps.push(flatten(), join({ keepNamed: false }));

    if (cfg.bakeFlatTextures) await bakeFlatTextures(doc);

    // Must happen before weld, so weld can merge on the remaining attributes. Dropping UVs is
    // only safe once the textures that referenced them are gone.
    for (const mesh of doc.getRoot().listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        if (cfg.dropNormals) prim.setAttribute("NORMAL", null);
        if (cfg.bakeFlatTextures) {
          for (const name of prim.listSemantics())
            if (name.startsWith("TEXCOORD_")) prim.setAttribute(name, null);
        }
      }
    }

    steps.push(
      weld(),
      simplify({ simplifier: MeshoptSimplifier, ratio: cfg.ratio, error: cfg.error, lockBorder: false }),
    );
  }

  steps.push(
    ...(AGGRESSIVE ? [palette({ min: 5 })] : []),
    textureCompress(
      AGGRESSIVE
        ? { encoder: sharp, targetFormat: "webp", resize: [1024, 1024] }
        : { encoder: sharp, targetFormat: "webp" },
    ),
    prune(AGGRESSIVE ? { keepAttributes: false, keepSolidTextures: false } : {}),
    sparse(),
  );

  await doc.transform(...steps);

  if (!cfg.skipGeometry && cfg.dropNormals) regenerateNormals(doc);

  await doc.transform(quantize());
  doc.createExtension(EXTMeshoptCompression)
    .setRequired(true)
    .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });

  await io.write(dst, doc);

  const after = countTris(doc);
  const oldMB = statSync(src).size / 1048576;
  const newMB = statSync(dst).size / 1048576;
  console.log(
    `${cfg.file.padEnd(22)} ${oldMB.toFixed(1)}MB -> ${newMB.toFixed(2)}MB  ` +
    `tris ${Math.round(before).toLocaleString()} -> ${Math.round(after).toLocaleString()}`,
  );
}
