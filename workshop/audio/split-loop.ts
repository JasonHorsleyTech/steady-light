#!/usr/bin/env npx tsx
// Split a long audio loop into individual variants by detecting silence gaps.
//
// Usage:
//   npx tsx workshop/audio/split-loop.ts <input.mp3> [output-dir] [--prefix <name>] [--threshold <dB>] [--min-silence <seconds>]
//
// Examples:
//   npx tsx workshop/audio/split-loop.ts footsteps-wet-stone.mp3 assets/audio/sfx/footsteps
//   npx tsx workshop/audio/split-loop.ts rain-loop.mp3 assets/audio/sfx/ambient --prefix rain --threshold -30
//   npx tsx workshop/audio/split-loop.ts sword-clangs.mp3 . --prefix clang --min-silence 0.1
//
// Defaults:
//   output-dir: same directory as input file
//   prefix: input filename without extension
//   threshold: -35 dB (silence detection sensitivity)
//   min-silence: 0.05 seconds (minimum gap to count as silence)
//
// How it works:
//   1. Detects silence gaps in the audio using sox
//   2. Splits at each gap into individual files
//   3. Trims and normalizes each segment
//   4. Names output: <prefix>_01.mp3, <prefix>_02.mp3, etc.
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
let inputPath = "";
let outputDir = "";
let prefix = "";
let threshold = "-35";
let minSilence = "0.05";

const args = process.argv.slice(2);
let i = 0;
while (i < args.length) {
  const arg = args[i];
  if (arg === "--prefix") {
    prefix = args[++i];
  } else if (arg === "--threshold") {
    threshold = args[++i];
  } else if (arg === "--min-silence") {
    minSilence = args[++i];
  } else if (arg.startsWith("--")) {
    console.error(`Unknown flag: ${arg}`);
    process.exit(1);
  } else if (!inputPath) {
    inputPath = arg;
  } else if (!outputDir) {
    outputDir = arg;
  }
  i++;
}

if (!inputPath) {
  console.log("Usage: split-loop.ts <input.mp3> [output-dir] [--prefix <name>] [--threshold <dB>] [--min-silence <sec>]");
  console.log("");
  console.log("Splits a long audio loop into individual variants at silence gaps.");
  console.log("");
  console.log("Options:");
  console.log("  --prefix <name>        Output filename prefix (default: input filename)");
  console.log("  --threshold <dB>       Silence threshold in dB (default: -35)");
  console.log("  --min-silence <sec>    Minimum silence duration to split at (default: 0.05)");
  process.exit(1);
}

const absInput = path.resolve(inputPath);
if (!fs.existsSync(absInput)) {
  console.error(`ERROR: File not found: ${absInput}`);
  process.exit(1);
}

checkDep("sox");
checkDep("ffmpeg");

// Defaults
const ext = path.extname(absInput);
const inputBasename = path.basename(absInput, ext);
if (!outputDir) outputDir = path.dirname(absInput);
if (!prefix) prefix = inputBasename;

fs.mkdirSync(outputDir, { recursive: true });

console.log("=== Split Loop ===");
console.log(`Input:      ${absInput}`);
console.log(`Output dir: ${outputDir}`);
console.log(`Prefix:     ${prefix}`);
console.log(`Threshold:  ${threshold}dB`);
console.log(`Min gap:    ${minSilence}s`);
console.log("");

// Create temp directory
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "split-loop-"));
const cleanup = () => {
  fs.rmSync(tempDir, { recursive: true, force: true });
};
process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(1); });

// Convert to WAV for sox processing
const tempWav = path.join(tempDir, "input.wav");
run(`ffmpeg -v quiet -y -i "${absInput}" "${tempWav}"`);

// Get total duration
const totalDuration = run(`soxi -D "${tempWav}"`, { ignoreError: true }) || "unknown";
console.log(`Total duration: ${totalDuration}s`);

// Use sox to split on silence
console.log("Detecting silence gaps and splitting...");
run(
  `sox "${tempWav}" "${path.join(tempDir, "split.wav")}" ` +
  `silence 1 ${minSilence} ${threshold}d 1 ${minSilence} ${threshold}d ` +
  `: newfile : restart`,
  { ignoreError: true }
);

// Find all split files
const splitFiles = fs.readdirSync(tempDir)
  .filter((f) => f.startsWith("split") && f.endsWith(".wav"))
  .sort()
  .map((f) => path.join(tempDir, f));

if (splitFiles.length === 0) {
  console.log("WARNING: No splits detected — the audio may not have silence gaps.");
  console.log("Try adjusting --threshold (higher = more sensitive) or --min-silence (lower = shorter gaps).");
  console.log("");
  console.log("Falling back: copying input as single segment.");
  fs.copyFileSync(tempWav, path.join(tempDir, "split001.wav"));
  splitFiles.push(path.join(tempDir, "split001.wav"));
}

console.log(`Found ${splitFiles.length} segments.`);
console.log("");

// Process each segment: trim silence, normalize, convert to MP3
let count = 0;
let goodCount = 0;

for (const splitFile of splitFiles) {
  count++;
  const padded = String(count).padStart(2, "0");

  // Check if segment has actual content (not just silence)
  const statOutput = run(`sox "${splitFile}" -n stat 2>&1`, { ignoreError: true });
  const rmsMatch = statOutput.match(/RMS.*amplitude:\s+([\d.]+)/);
  const rms = rmsMatch ? parseFloat(rmsMatch[1]) : 0;

  if (rms < 0.001) {
    console.log(`  Segment ${padded}: silent (RMS: ${rms}) — skipping`);
    continue;
  }

  // Trim silence + normalize
  const processed = path.join(tempDir, `processed_${padded}.wav`);
  const trimResult = run(
    `sox "${splitFile}" "${processed}" ` +
    `silence 1 0.01 -40d reverse silence 1 0.01 -40d reverse norm`,
    { ignoreError: true }
  );

  if (!fs.existsSync(processed)) continue;

  // Check if result is too short (< 50ms)
  const duration = parseFloat(run(`soxi -D "${processed}"`, { ignoreError: true }) || "0");
  if (duration < 0.05) {
    console.log(`  Segment ${padded}: too short (${duration}s) — skipping`);
    continue;
  }

  // Convert to MP3
  const outputFile = path.join(outputDir, `${prefix}_${padded}.mp3`);
  run(`ffmpeg -v quiet -y -i "${processed}" -codec:a libmp3lame -b:a 128k "${outputFile}"`);

  const fileSize = fs.statSync(outputFile).size;
  console.log(`  ${prefix}_${padded}.mp3 — ${duration}s, ${fileSize} bytes, RMS: ${rms}`);
  goodCount++;
}

console.log("");
console.log(`=== SPLIT COMPLETE: ${goodCount} segments from ${count} detected ===`);

// Auto-verify each output
if (goodCount > 0) {
  console.log("");
  console.log("--- Quick verification ---");
  const outputFiles = fs.readdirSync(outputDir)
    .filter((f) => f.startsWith(prefix + "_") && f.endsWith(".mp3"))
    .sort();
  for (const f of outputFiles) {
    const filePath = path.join(outputDir, f);
    const stat = run(`sox "${filePath}" -n stat 2>&1`, { ignoreError: true });
    const rmsM = stat.match(/RMS.*amplitude:\s+([\d.]+)/);
    const peakM = stat.match(/Maximum amplitude:\s+([\d.]+)/);
    const dur = run(`soxi -D "${filePath}"`, { ignoreError: true }) || "?";
    console.log(`  ${f}: ${dur}s, RMS=${rmsM?.[1] ?? "?"}, Peak=${peakM?.[1] ?? "?"}`);
  }
}
