#!/usr/bin/env npx tsx
// Combine individual MP3 files into a single audio sprite + Howler.js-compatible JSON manifest.
//
// Usage:
//   npx tsx workshop/audio/build-sprite.ts <input-dir | file1.mp3 file2.mp3 ...> [--output <name>] [--gap <ms>]
//
// Examples:
//   npx tsx workshop/audio/build-sprite.ts assets/audio/sfx/combat/ --output combat-sprites
//   npx tsx workshop/audio/build-sprite.ts hit-slime.mp3 block.mp3 dodge.mp3 --output combat-sprites
//   npx tsx workshop/audio/build-sprite.ts assets/audio/sfx/footsteps/ --output footstep-dirt-sprites --gap 100
//
// Options:
//   --output <name>   Output filename without extension (default: "sprite")
//   --gap <ms>        Silence gap between sounds in milliseconds (default: 50)
//   --outdir <dir>    Output directory (default: same as input directory or cwd)
//
// Output:
//   <name>.mp3   — Combined audio sprite file
//   <name>.json  — Howler.js-compatible sprite manifest
//
// The JSON manifest looks like:
//   {
//     "src": ["combat-sprites.mp3"],
//     "sprite": {
//       "hit-slime": [0, 1200],
//       "block": [1250, 800],
//       "dodge": [2100, 600]
//     }
//   }
//
// Requires: sox, ffmpeg

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

function run(cmd: string, opts?: { ignoreError?: boolean }): string {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch (e) {
    if (opts?.ignoreError) return "";
    throw e;
  }
}

function checkDep(name: string): void {
  try {
    execSync(`command -v ${name}`, { stdio: "pipe" });
  } catch {
    console.error(`ERROR: ${name} is required. Install with: brew install ${name}`);
    process.exit(1);
  }
}

// Parse args
const files: string[] = [];
let outputName = "sprite";
let gapMs = 50;
let outputDir = "";

const args = process.argv.slice(2);
let i = 0;
while (i < args.length) {
  const arg = args[i];
  if (arg === "--output") {
    outputName = args[++i];
  } else if (arg === "--gap") {
    gapMs = parseInt(args[++i], 10);
  } else if (arg === "--outdir") {
    outputDir = args[++i];
  } else if (arg.startsWith("--")) {
    console.error(`Unknown flag: ${arg}`);
    process.exit(1);
  } else {
    const resolved = path.resolve(arg);
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      const mp3s = fs.readdirSync(resolved)
        .filter((f) => f.endsWith(".mp3"))
        .sort()
        .map((f) => path.join(resolved, f));
      files.push(...mp3s);
      if (!outputDir) outputDir = resolved;
    } else if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      files.push(resolved);
    } else {
      console.error(`ERROR: Not a file or directory: ${arg}`);
      process.exit(1);
    }
  }
  i++;
}

if (files.length === 0) {
  console.log("Usage: build-sprite.ts <input-dir | file1.mp3 ...> [--output <name>] [--gap <ms>]");
  console.log("");
  console.log("Combines MP3 files into an audio sprite + Howler.js JSON manifest.");
  console.log("");
  console.log("Options:");
  console.log("  --output <name>   Output filename (default: 'sprite')");
  console.log("  --gap <ms>        Silence between sounds in ms (default: 50)");
  console.log("  --outdir <dir>    Output directory (default: input dir or cwd)");
  process.exit(1);
}

checkDep("sox");
checkDep("ffmpeg");

if (!outputDir) outputDir = ".";

console.log("=== Audio Sprite Builder ===");
console.log(`Files:  ${files.length}`);
console.log(`Output: ${outputDir}/${outputName}.{mp3,json}`);
console.log(`Gap:    ${gapMs}ms`);
console.log("");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "build-sprite-"));
const cleanup = () => {
  fs.rmSync(tempDir, { recursive: true, force: true });
};
process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(1); });

// Step 1: Convert all inputs to WAV at consistent sample rate
console.log("Preparing files...");
const wavs: string[] = [];
const names: string[] = [];
const durations: number[] = [];

for (const file of files) {
  const basename = path.basename(file, ".mp3");
  const wavFile = path.join(tempDir, `${basename}.wav`);

  run(`ffmpeg -v quiet -y -i "${file}" -ar 44100 -ac 1 "${wavFile}"`);

  const durationSec = parseFloat(run(`soxi -D "${wavFile}"`, { ignoreError: true }) || "0");
  const durationMs = Math.round(durationSec * 1000);

  console.log(`  ${basename}: ${durationMs}ms`);

  wavs.push(wavFile);
  names.push(basename);
  durations.push(durationMs);
}

console.log("");

// Step 2: Generate silence gap
const gapSec = gapMs / 1000;
const gapFile = path.join(tempDir, "_gap.wav");
run(`sox -n -r 44100 -c 1 "${gapFile}" trim 0 ${gapSec}`);

// Step 3: Concatenate with gaps
console.log("Concatenating...");
const concatList: string[] = [];
for (let j = 0; j < wavs.length; j++) {
  concatList.push(`"${wavs[j]}"`);
  if (j < wavs.length - 1) {
    concatList.push(`"${gapFile}"`);
  }
}

const combinedWav = path.join(tempDir, "combined.wav");
run(`sox ${concatList.join(" ")} "${combinedWav}"`);

// Step 4: Convert to MP3
fs.mkdirSync(outputDir, { recursive: true });
const outputMp3 = path.join(outputDir, `${outputName}.mp3`);
run(`ffmpeg -v quiet -y -i "${combinedWav}" -codec:a libmp3lame -b:a 128k "${outputMp3}"`);

const totalSize = fs.statSync(outputMp3).size;
const totalDuration = run(`soxi -D "${combinedWav}"`, { ignoreError: true }) || "0";
console.log(`Combined: ${totalDuration}s, ${totalSize} bytes`);
console.log("");

// Step 5: Build Howler.js manifest
console.log("Building manifest...");
const outputJson = path.join(outputDir, `${outputName}.json`);

const sprite: Record<string, [number, number]> = {};
let offset = 0;
for (let j = 0; j < names.length; j++) {
  sprite[names[j]] = [offset, durations[j]];
  offset += durations[j] + gapMs;
}

const manifest = {
  src: [`${outputName}.mp3`],
  sprite,
};

fs.writeFileSync(outputJson, JSON.stringify(manifest, null, 2) + "\n");

console.log("Manifest:");
console.log(fs.readFileSync(outputJson, "utf-8"));

console.log("=== SPRITE BUILD OK ===");
console.log("Files:");
console.log(`  ${outputMp3} (${totalSize} bytes)`);
console.log(`  ${outputJson}`);
