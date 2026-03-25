#!/usr/bin/env npx tsx
// Compile .ink files to .ink.json using inkjs compiler.
//
// Usage:
//   npx tsx workshop/dialogue/compile-ink.ts <input.ink> [output.ink.json]
//   npx tsx workshop/dialogue/compile-ink.ts assets/dialogue/farmer.ink
//
// If no output path is given, replaces .ink with .ink.json.
// Exits 0 on success, 1 on compile errors.

import fs from "fs";
import path from "path";
import { Compiler } from "inkjs/compiler/Compiler";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error(
    "Usage: compile-ink.ts <input.ink> [output.ink.json]\n\nCompiles an ink file to ink.json for use with the inkjs runtime."
  );
  process.exit(1);
}

const absInput = path.resolve(inputPath);
if (!fs.existsSync(absInput)) {
  console.error(`ERROR: File not found: ${absInput}`);
  process.exit(1);
}

const outputPath = process.argv[3] || absInput.replace(/\.ink$/, ".ink.json");
const absOutput = path.resolve(outputPath);

console.log(`=== Ink Compiler ===`);
console.log(`Input:  ${absInput}`);
console.log(`Output: ${absOutput}`);
console.log();

const inkSource = fs.readFileSync(absInput, "utf-8");

// Compile with error collection
let compiler: InstanceType<typeof Compiler>;
try {
  compiler = new Compiler(inkSource, {
    fileHandler: {
      ResolveInkFilename(filename: string): string {
        return filename;
      },
      LoadInkFileContents(filename: string): string | null {
        const includePath = path.resolve(path.dirname(absInput), filename);
        if (!fs.existsSync(includePath)) {
          return null;
        }
        return fs.readFileSync(includePath, "utf-8");
      },
    },
  } as any);
} catch (err) {
  console.error(`COMPILE ERROR: ${(err as Error).message}`);
  process.exit(1);
}

let story: ReturnType<typeof compiler.Compile>;
try {
  story = compiler.Compile();
} catch (err) {
  console.error(`COMPILE ERROR: ${(err as Error).message}`);
  process.exit(1);
}

// Report errors and warnings
const errors: string[] = (compiler as any).errors || [];
const warnings: string[] = (compiler as any).warnings || [];

if (warnings.length > 0) {
  console.log(`Warnings (${warnings.length}):`);
  warnings.forEach((w) => console.log(`  WARNING: ${w}`));
  console.log();
}

if (errors.length > 0) {
  console.log(`Errors (${errors.length}):`);
  errors.forEach((e) => console.log(`  ERROR: ${e}`));
  console.log();
  console.log("=== COMPILE FAILED ===");
  process.exit(1);
}

if (!story) {
  console.error("ERROR: Compilation produced no story object");
  process.exit(1);
}

// Write output
const json = story.ToJson() as string;
const outputDir = path.dirname(absOutput);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
fs.writeFileSync(absOutput, json, "utf-8");

const stats = {
  inputSize: fs.statSync(absInput).size,
  outputSize: fs.statSync(absOutput).size,
};

console.log(
  `Compiled successfully: ${stats.inputSize} bytes → ${stats.outputSize} bytes`
);
console.log("=== COMPILE OK ===");
