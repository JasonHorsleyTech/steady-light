#!/usr/bin/env node
// Compile .ink files to .ink.json using inkjs compiler.
//
// Usage:
//   node workshop/dialogue/compile-ink.js <input.ink> [output.ink.json]
//   node workshop/dialogue/compile-ink.js assets/dialogue/farmer.ink
//   node workshop/dialogue/compile-ink.js assets/dialogue/farmer.ink assets/dialogue/farmer.ink.json
//
// If no output path is given, replaces .ink with .ink.json.
// Exits 0 on success, 1 on compile errors.

const fs = require("fs");
const path = require("path");
const { Compiler } = require("inkjs/compiler/Compiler");

const inputPath = process.argv[2];
if (!inputPath) {
  console.error(
    "Usage: compile-ink.js <input.ink> [output.ink.json]\n\nCompiles an ink file to ink.json for use with the inkjs runtime."
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
let compiler;
try {
  compiler = new Compiler(inkSource, {
    // File handler for INCLUDE statements — resolves relative to the input file
    fileHandler: {
      ResolveInkFilename(filename) {
        return filename;
      },
      LoadInkFileContents(filename) {
        const includePath = path.resolve(path.dirname(absInput), filename);
        if (!fs.existsSync(includePath)) {
          return null;
        }
        return fs.readFileSync(includePath, "utf-8");
      },
    },
  });
} catch (err) {
  console.error(`COMPILE ERROR: ${err.message}`);
  process.exit(1);
}

let story;
try {
  story = compiler.Compile();
} catch (err) {
  console.error(`COMPILE ERROR: ${err.message}`);
  process.exit(1);
}

// Report errors and warnings
const errors = compiler.errors || [];
const warnings = compiler.warnings || [];

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
const json = story.ToJson();
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
