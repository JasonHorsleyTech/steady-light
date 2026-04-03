#!/usr/bin/env npx tsx
// Play through an ink file with a choice sequence and output the full transcript.
// This lets agents "playtest" dialogue without a browser.
//
// Usage:
//   npx tsx workshop/dialogue/test-dialogue.ts <input.ink | input.ink.json> [choices]
//
// Examples:
//   npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink
//   npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink "1,2,1"
//   npx tsx workshop/dialogue/test-dialogue.ts assets/dialogue/farmer.ink "0,0,0" --verbose
//
// Choice sequence: comma-separated 0-based indices. If omitted, always picks choice 0.
// --verbose: also logs tags and internal variable changes.

import fs from "fs";
import path from "path";
import { Story } from "inkjs";
import { Compiler } from "inkjs/compiler/Compiler";
import { ErrorType } from "inkjs/engine/Error";

// Parse args
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));
const verbose = flags.includes("--verbose");

const inputPath = args[0];
const choiceStr = args[1] || "";

if (!inputPath) {
  console.error(
    "Usage: test-dialogue.ts <input.ink | input.ink.json> [choices] [--verbose]\n" +
      "\n" +
      "Plays through an ink dialogue with specified choices and prints the transcript.\n" +
      "Choices are 0-based, comma-separated. Omit for auto-play (always picks 0).\n" +
      "\n" +
      "Examples:\n" +
      '  test-dialogue.ts farmer.ink "1,2,1"\n' +
      "  test-dialogue.ts farmer.ink.json --verbose"
  );
  process.exit(1);
}

const absInput = path.resolve(inputPath);
if (!fs.existsSync(absInput)) {
  console.error(`ERROR: File not found: ${absInput}`);
  process.exit(1);
}

// Parse choice sequence
const choices: number[] = choiceStr
  ? choiceStr.split(",").map((s) => {
      const n = parseInt(s.trim(), 10);
      if (isNaN(n) || n < 0) {
        console.error(`ERROR: Invalid choice index: "${s.trim()}"`);
        process.exit(1);
      }
      return n;
    })
  : [];
let choiceIndex = 0;

// Load story — compile if .ink, load directly if .ink.json
let story: InstanceType<typeof Story>;

if (absInput.endsWith(".ink.json")) {
  const json = fs.readFileSync(absInput, "utf-8");
  story = new Story(json);
} else if (absInput.endsWith(".ink")) {
  const source = fs.readFileSync(absInput, "utf-8");
  const compileErrors: string[] = [];
  const compiler = new Compiler(source, {
    errorHandler: (message: string, errorType: ErrorType) => {
      if (errorType === ErrorType.Error) {
        compileErrors.push(message);
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
  let compiled: ReturnType<typeof compiler.Compile>;
  try {
    compiled = compiler.Compile();
  } catch {
    compiled = null as any; // checked for null after error reporting
  }
  if (!compiled || compileErrors.length > 0) {
    console.error("COMPILE ERRORS:");
    compileErrors.forEach((e: string) => console.error(`  ${e}`));
    process.exit(1);
  }
  story = new Story(compiled.ToJson() as string);
} else {
  console.error("ERROR: Input must be .ink or .ink.json");
  process.exit(1);
}

// Play through
console.log("=== Dialogue Transcript ===");
console.log(`Source: ${path.basename(absInput)}`);
console.log(`Choices: ${choiceStr || "(auto: always pick 0)"}`);
console.log("---");
console.log();

let turnCount = 0;
const maxTurns = 1000; // safety valve

while (turnCount < maxTurns) {
  // Continue until we hit choices or end
  while (story.canContinue) {
    story.Continue();
    const text = story.currentText?.trim();
    if (text) {
      console.log(text);
    }

    // Log tags if verbose
    if (verbose && story.currentTags && story.currentTags.length > 0) {
      console.log(`  [tags: ${story.currentTags.join(", ")}]`);
    }
  }

  // Check for choices
  if (story.currentChoices.length === 0) {
    break; // Story ended
  }

  // Display choices
  console.log();
  story.currentChoices.forEach((choice: { text: string }, i: number) => {
    const marker =
      choiceIndex < choices.length && choices[choiceIndex] === i
        ? " <--"
        : choiceIndex >= choices.length && i === 0
          ? " <-- (auto)"
          : "";
    console.log(`  [${i}] ${choice.text}${marker}`);
  });

  // Pick choice
  let pick: number;
  if (choiceIndex < choices.length) {
    pick = choices[choiceIndex];
  } else {
    pick = 0; // auto-pick first choice
  }

  if (pick >= story.currentChoices.length) {
    console.error(
      `\nERROR: Choice ${pick} out of range (only ${story.currentChoices.length} choices available)`
    );
    process.exit(1);
  }

  console.log(`\n> Choice: [${pick}] ${story.currentChoices[pick].text}`);
  console.log();
  story.ChooseChoiceIndex(pick);
  choiceIndex++;
  turnCount++;
}

if (turnCount >= maxTurns) {
  console.log("\n[WARNING: Hit max turn limit — possible infinite loop]");
}

console.log();
console.log("--- END ---");

// Summary
if (verbose) {
  console.log();
  console.log("=== Summary ===");
  console.log(`Turns: ${turnCount}`);
  console.log(
    `Choices made: ${Math.min(choiceIndex, choices.length)} specified + ${Math.max(0, turnCount - choices.length)} auto`
  );
}
