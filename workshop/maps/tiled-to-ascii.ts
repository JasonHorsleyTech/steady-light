#!/usr/bin/env npx tsx
// Convert a Tiled JSON map to ASCII representation.
// Agents use this to "see" maps without a visual renderer.
//
// Usage:
//   npx tsx workshop/maps/tiled-to-ascii.ts <map.json> [--layer <name>] [--legend]
//
// Examples:
//   npx tsx workshop/maps/tiled-to-ascii.ts assets/maps/town.json
//   npx tsx workshop/maps/tiled-to-ascii.ts assets/maps/town.json --layer collision
//   npx tsx workshop/maps/tiled-to-ascii.ts assets/maps/town.json --legend

import fs from "fs";
import path from "path";

interface TiledObject {
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: Array<{ name: string; value: string | number | boolean; type?: string }>;
}

interface TiledLayer {
  name: string;
  type: "tilelayer" | "objectgroup" | "group";
  visible: boolean;
  width?: number;
  height?: number;
  data?: number[];
  objects?: TiledObject[];
  layers?: TiledLayer[];
}

interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
}

// Parse args
const rawArgs = process.argv.slice(2);
const flags: { layer?: string; legend?: boolean } = {};
let mapPath: string | null = null;

for (let i = 0; i < rawArgs.length; i++) {
  if (rawArgs[i] === "--layer" && rawArgs[i + 1]) {
    flags.layer = rawArgs[++i];
  } else if (rawArgs[i] === "--legend") {
    flags.legend = true;
  } else if (!rawArgs[i].startsWith("--")) {
    mapPath = rawArgs[i];
  }
}

if (!mapPath) {
  console.error(
    "Usage: tiled-to-ascii.ts <map.json> [--layer <name>] [--legend]\n" +
      "\n" +
      "Renders a Tiled JSON map as ASCII art.\n" +
      "  --layer <name>  Show only this layer\n" +
      "  --legend        Show tile ID to character legend"
  );
  process.exit(1);
}

const absPath = path.resolve(mapPath);
if (!fs.existsSync(absPath)) {
  console.error(`ERROR: File not found: ${absPath}`);
  process.exit(1);
}

let mapData: TiledMap;
try {
  mapData = JSON.parse(fs.readFileSync(absPath, "utf-8"));
} catch (err) {
  console.error(`ERROR: Invalid JSON: ${(err as Error).message}`);
  process.exit(1);
}

// Generate a readable character for a tile index
function tileChar(tileId: number): string {
  if (tileId === 0) return ".";
  if (tileId <= 16) return " "; // ground (walkable)
  if (tileId <= 32) return "#"; // walls/buildings
  if (tileId <= 48) return "o"; // objects/furniture
  if (tileId <= 64) return "~"; // water/hazards
  if (tileId <= 80) return "*"; // decorations
  if (tileId <= 96) return "T"; // trees/nature
  if (tileId <= 112) return "^"; // elevation
  return (tileId % 16).toString(16); // fallback
}

console.log(`=== Tiled Map: ${path.basename(absPath)} ===`);
console.log(
  `Size: ${mapData.width}x${mapData.height} tiles (${mapData.tilewidth}x${mapData.tileheight}px each)`
);
console.log(`Layers: ${mapData.layers.length}`);
console.log();

const usedTiles = new Set<number>();

for (const layer of mapData.layers) {
  if (flags.layer && layer.name.toLowerCase() !== flags.layer.toLowerCase()) {
    continue;
  }

  if (layer.type === "tilelayer") {
    console.log(
      `--- Layer: ${layer.name} (tile, ${layer.visible ? "visible" : "hidden"}) ---`
    );

    if (!layer.data || layer.data.length === 0) {
      console.log("  (empty layer)");
      console.log();
      continue;
    }

    const width = layer.width || mapData.width;
    const height = layer.height || mapData.height;

    const colHeader =
      "    " +
      Array.from({ length: width }, (_, i) => (i % 10).toString()).join("");
    console.log(colHeader);

    for (let y = 0; y < height; y++) {
      let row = `${String(y).padStart(3)} `;
      for (let x = 0; x < width; x++) {
        const tileId = layer.data[y * width + x];
        usedTiles.add(tileId);
        row += tileChar(tileId);
      }
      console.log(row);
    }
    console.log();
  } else if (layer.type === "objectgroup") {
    console.log(
      `--- Layer: ${layer.name} (objects, ${layer.visible ? "visible" : "hidden"}) ---`
    );

    if (!layer.objects || layer.objects.length === 0) {
      console.log("  (no objects)");
      console.log();
      continue;
    }

    const sorted = [...layer.objects].sort((a, b) => a.y - b.y || a.x - b.x);

    for (const obj of sorted) {
      const tileX = Math.floor(obj.x / mapData.tilewidth);
      const tileY = Math.floor(obj.y / mapData.tileheight);
      const props = obj.properties
        ? obj.properties.map((p) => `${p.name}=${p.value}`).join(", ")
        : "";
      console.log(
        `  [${tileX},${tileY}] ${obj.type || "object"}: "${obj.name || "(unnamed)"}"${props ? ` (${props})` : ""}`
      );
    }
    console.log();

    // Render objects on a grid
    if (mapData.width && mapData.height) {
      const grid: string[][] = Array.from({ length: mapData.height }, () =>
        Array(mapData.width).fill(".")
      );

      const objectChars: Record<string, string> = {};
      let charIdx = 0;
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

      sorted.forEach((obj) => {
        const tileX = Math.floor(obj.x / mapData.tilewidth);
        const tileY = Math.floor(obj.y / mapData.tileheight);
        if (
          tileX >= 0 &&
          tileX < mapData.width &&
          tileY >= 0 &&
          tileY < mapData.height
        ) {
          const ch = chars[charIdx % chars.length];
          grid[tileY][tileX] = ch;
          objectChars[ch] = obj.name || obj.type || "(unnamed)";
          charIdx++;
        }
      });

      const colHeader =
        "    " +
        Array.from({ length: mapData.width }, (_, i) =>
          (i % 10).toString()
        ).join("");
      console.log(colHeader);

      for (let y = 0; y < mapData.height; y++) {
        console.log(`${String(y).padStart(3)} ${grid[y].join("")}`);
      }
      console.log();

      Object.entries(objectChars).forEach(([ch, name]) => {
        console.log(`  ${ch} = ${name}`);
      });
      console.log();
    }
  } else if (layer.type === "group") {
    console.log(
      `--- Layer Group: ${layer.name} (${layer.layers ? layer.layers.length : 0} sub-layers) ---`
    );
    console.log("  (group layers — run with --layer to see individual layers)");
    console.log();
  }
}

if (flags.legend) {
  console.log("=== Tile Legend ===");
  const sortedTiles = [...usedTiles].sort((a, b) => a - b);
  sortedTiles.forEach((id) => {
    console.log(`  ${String(id).padStart(3)}: '${tileChar(id)}'`);
  });
  console.log();
}

console.log("=== DONE ===");
