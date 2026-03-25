#!/usr/bin/env npx tsx
// Pack individual sprite frames into a texture atlas using free-tex-packer-core.
// Outputs a PNG atlas + JSON manifest in PixiJS-compatible TexturePacker JSON Hash format.
//
// Usage:
//   npx tsx workshop/sprites/pack-sprites.ts <input-dir> [output-dir] [--name <atlas-name>]
//
// Examples:
//   npx tsx workshop/sprites/pack-sprites.ts assets/sprites/slime/frames
//   npx tsx workshop/sprites/pack-sprites.ts assets/sprites/slime/frames assets/sprites/slime --name slime

import fs from "fs";
import path from "path";
import { packAsync } from "free-tex-packer-core";

// Parse args
const allArgs = process.argv.slice(2);
const positionalArgs = allArgs.filter((a) => !a.startsWith("--"));
let atlasName = "atlas";

for (let i = 0; i < allArgs.length; i++) {
  if (allArgs[i] === "--name" && allArgs[i + 1]) {
    atlasName = allArgs[++i];
  }
}

const inputDir = positionalArgs[0];
const outputDir = positionalArgs[1];

if (!inputDir) {
  console.error(
    "Usage: pack-sprites.ts <input-dir> [output-dir] [--name <atlas-name>]\n" +
      "\n" +
      "Packs PNG frames into a texture atlas + JSON manifest.\n" +
      "  --name <name>  Atlas filename (default: 'atlas')"
  );
  process.exit(1);
}

const absInput = path.resolve(inputDir);
const absOutput = path.resolve(outputDir || inputDir);

if (!fs.existsSync(absInput)) {
  console.error(`ERROR: Input directory not found: ${absInput}`);
  process.exit(1);
}

// Find all PNG files in the input directory
const pngFiles = fs
  .readdirSync(absInput)
  .filter((f) => f.toLowerCase().endsWith(".png"))
  .sort();

if (pngFiles.length === 0) {
  console.error(`ERROR: No PNG files found in: ${absInput}`);
  process.exit(1);
}

console.log(`=== Sprite Packer ===`);
console.log(`Input:  ${absInput} (${pngFiles.length} frames)`);
console.log(`Output: ${absOutput}/${atlasName}.{png,json}`);
console.log();

// Load images
const images = pngFiles.map((filename) => ({
  path: filename,
  contents: fs.readFileSync(path.join(absInput, filename)),
}));

// Pack
const options = {
  textureName: atlasName,
  width: 2048,
  height: 2048,
  fixedSize: false,
  powerOfTwo: true,
  padding: 1,
  allowRotation: false,
  detectIdentical: true,
  allowTrim: true,
  exporter: "JsonHash" as any, // packAsync types don't accept string literals, but this is the correct runtime value
  removeFileExtension: false,
  prependFolderName: false,
};

(async () => {
  try {
    const files = await packAsync(images, options);

    if (!fs.existsSync(absOutput)) {
      fs.mkdirSync(absOutput, { recursive: true });
    }

    for (const file of files) {
      const outputPath = path.join(absOutput, file.name);
      fs.writeFileSync(outputPath, file.buffer);
      const size = file.buffer.length;
      const isImage = file.name.endsWith(".png");
      console.log(
        `  ${file.name} (${size} bytes${isImage ? ", image" : ", manifest"})`
      );
    }

    console.log();
    console.log(`Packed ${pngFiles.length} frames into atlas.`);
    console.log("=== PACK OK ===");
  } catch (err) {
    console.error(`ERROR: Packing failed: ${(err as Error).message}`);
    process.exit(1);
  }
})();
