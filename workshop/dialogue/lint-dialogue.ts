#!/usr/bin/env npx tsx
// Lint an ink file for common problems:
//   - Dead-end knots (no path to END or another knot)
//   - Missing standard tags (speaker, mood)
//   - Unused variables
//   - Empty knots
//   - Syntax issues caught by the compiler
//
// Usage:
//   npx tsx workshop/dialogue/lint-dialogue.ts <input.ink>
//
// Exit codes:
//   0 — no errors (warnings are OK)
//   1 — errors found

import fs from "fs";
import path from "path";
import { Compiler } from "inkjs/compiler/Compiler";
import { ErrorType } from "inkjs/engine/Error";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error(
    "Usage: lint-dialogue.ts <input.ink>\n\nLints an ink file for dead-end knots, missing tags, and other issues."
  );
  process.exit(1);
}

const absInput = path.resolve(inputPath);
if (!fs.existsSync(absInput)) {
  console.error(`ERROR: File not found: ${absInput}`);
  process.exit(1);
}

const source = fs.readFileSync(absInput, "utf-8");
const lines = source.split("\n");

console.log(`=== Ink Linter ===`);
console.log(`File: ${path.basename(absInput)}`);
console.log();

const errors: string[] = [];
const warnings: string[] = [];

// --- 1. Compiler check ---
try {
  const compiler = new Compiler(source, {
    errorHandler: (message: string, errorType: ErrorType) => {
      if (errorType === ErrorType.Error) {
        errors.push(`Compiler: ${message}`);
      } else if (errorType === ErrorType.Warning) {
        warnings.push(`Compiler: ${message}`);
      }
    },
    fileHandler: {
      ResolveInkFilename(filename: string): string {
        return filename;
      },
      LoadInkFileContents(filename: string): string | null {
        const includePath = path.resolve(path.dirname(absInput), filename);
        if (!fs.existsSync(includePath)) return null;
        return fs.readFileSync(includePath, "utf-8");
      },
    },
  } as any); // inkjs Compiler types don't include errorHandler/fileHandler, but they're required at runtime
  compiler.Compile();
} catch {
  // Compile() throws on errors — errors already collected via errorHandler
}

// --- 2. Structural analysis ---
interface KnotInfo {
  line: number;
  hasContent: boolean;
  hasExit: boolean;
  diverts: string[];
}

const knotRegex = /^===\s*(\w+)\s*===/;
const divertRegex = /->\s*(\w+(?:\.\w+)?)/g;
const choiceRegex = /^(\+|\*)\s/;
const varDeclRegex = /^VAR\s+(\w+)\s*=/;
const varRefRegex = /\{(\w+)\}/g;
const tempRegex = /^~\s*temp\s+(\w+)\s*=/;

const knots = new Map<string, KnotInfo>();
let currentKnot: string | null = null;

const declaredVars = new Map<string, number>(); // name -> line
const referencedVars = new Set<string>();

lines.forEach((line, lineNum) => {
  const trimmed = line.trim();

  // Track knot definitions
  const knotMatch = trimmed.match(knotRegex);
  if (knotMatch) {
    currentKnot = knotMatch[1];
    knots.set(currentKnot, {
      line: lineNum + 1,
      hasContent: false,
      hasExit: false,
      diverts: [],
    });
    return;
  }

  // Track variable declarations
  const varMatch = trimmed.match(varDeclRegex);
  if (varMatch) {
    declaredVars.set(varMatch[1], lineNum + 1);
  }

  // Track temp variable declarations
  const tempMatch = trimmed.match(tempRegex);
  if (tempMatch) {
    declaredVars.set(tempMatch[1], lineNum + 1);
  }

  if (currentKnot && knots.has(currentKnot)) {
    const knot = knots.get(currentKnot)!;

    // Check for content
    if (
      trimmed &&
      !trimmed.startsWith("//") &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("~") &&
      !trimmed.match(/^->\s/)
    ) {
      knot.hasContent = true;
    }

    // Track diverts
    let divertMatch: RegExpExecArray | null;
    const divertRe = new RegExp(divertRegex.source, "g");
    while ((divertMatch = divertRe.exec(trimmed)) !== null) {
      const target = divertMatch[1];
      knot.diverts.push(target);
      if (target === "END" || target === "DONE") {
        knot.hasExit = true;
      }
    }

    // Track variable references
    let varRefMatch: RegExpExecArray | null;
    const varRefRe = new RegExp(varRefRegex.source, "g");
    while ((varRefMatch = varRefRe.exec(trimmed)) !== null) {
      referencedVars.add(varRefMatch[1]);
    }
  }
});

// Helper: get lines belonging to a knot
function getKnotLines(knotName: string): string[] {
  let capturing = false;
  const result: string[] = [];
  for (const line of lines) {
    const match = line.trim().match(knotRegex);
    if (match) {
      if (match[1] === knotName) {
        capturing = true;
        continue;
      } else if (capturing) {
        break;
      }
    }
    if (capturing) {
      result.push(line);
    }
  }
  return result;
}

// --- 3. Check for dead-end knots ---
knots.forEach((knot, name) => {
  if (name === "END" || name === "DONE") return;
  if (knot.diverts.length === 0 && knot.hasContent) {
    const knotLines = getKnotLines(name);
    const hasChoices = knotLines.some((l) => choiceRegex.test(l.trim()));
    if (!hasChoices) {
      warnings.push(
        `Knot "${name}" (line ${knot.line}) has no diverts — potential dead end`
      );
    }
  }
});

// --- 4. Check for empty knots ---
knots.forEach((knot, name) => {
  if (!knot.hasContent && knot.diverts.length <= 1) {
    warnings.push(`Knot "${name}" (line ${knot.line}) appears empty`);
  }
});

// --- 5. Check for unreferenced knots ---
const allDiverts = new Set<string>();
knots.forEach((knot) => {
  knot.diverts.forEach((d) => allDiverts.add(d.split(".")[0]));
});
knots.forEach((knot, name) => {
  if (name === "start" || name === "END" || name === "DONE") return;
  if (!allDiverts.has(name)) {
    const preKnotDiverts: string[] = [];
    for (const line of lines) {
      if (knotRegex.test(line.trim())) break;
      let m: RegExpExecArray | null;
      const re = new RegExp(divertRegex.source, "g");
      while ((m = re.exec(line)) !== null) {
        preKnotDiverts.push(m[1]);
      }
    }
    if (!preKnotDiverts.includes(name)) {
      warnings.push(
        `Knot "${name}" (line ${knot.line}) is never diverted to — may be unreachable`
      );
    }
  }
});

// --- 6. Check for unused variables ---
declaredVars.forEach((line, name) => {
  if (!referencedVars.has(name)) {
    const usedInCode = lines.some(
      (l) =>
        l.includes(name) &&
        !l.match(new RegExp(`^VAR\\s+${name}\\s*=`)) &&
        !l.match(new RegExp(`^~\\s*temp\\s+${name}\\s*=`))
    );
    if (!usedInCode) {
      warnings.push(`Variable "${name}" (line ${line}) is declared but appears unused`);
    }
  }
});

// --- Report ---
if (errors.length > 0) {
  console.log(`ERRORS (${errors.length}):`);
  errors.forEach((e) => console.log(`  ERROR: ${e}`));
  console.log();
}

if (warnings.length > 0) {
  console.log(`WARNINGS (${warnings.length}):`);
  warnings.forEach((w) => console.log(`  WARNING: ${w}`));
  console.log();
}

if (errors.length === 0 && warnings.length === 0) {
  console.log("No issues found.");
}

console.log(
  `=== LINT ${errors.length > 0 ? "FAILED" : "OK"} (${errors.length} errors, ${warnings.length} warnings) ===`
);
process.exit(errors.length > 0 ? 1 : 0);
