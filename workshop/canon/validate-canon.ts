#!/usr/bin/env tsx
/**
 * Validate game content against the canonical state manifest.
 * Checks ink files, cross-references, prices, and flags for consistency.
 *
 * Usage:
 *   npx tsx workshop/canon/validate-canon.ts [--manifest <path>]
 *
 * Exit codes:
 *   0 — all checks pass
 *   1 — errors found
 */

import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const DEFAULT_MANIFEST = path.join(PROJECT_ROOT, "docs/canon/state-manifest.json");
const DIALOGUE_DIR = path.join(PROJECT_ROOT, "assets/dialogue");

// --- CLI args ---
let manifestPath = DEFAULT_MANIFEST;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--manifest" && args[i + 1]) {
    manifestPath = path.resolve(args[i + 1]);
    i++;
  }
}

// --- Counters ---
let errors = 0;
let warnings = 0;

function error(msg: string): void {
  console.log(`  ERROR: ${msg}`);
  errors++;
}

function warn(msg: string): void {
  console.log(`  WARNING: ${msg}`);
  warnings++;
}

function ok(msg: string): void {
  console.log(`  OK: ${msg}`);
}

// --- Types for the manifest ---
interface ManifestItem {
  price: number;
  damage_multiplier?: number;
  damage_reduction?: number;
  beats_per_attack?: number;
  movement_cost?: number;
  shop_description?: string;
  description?: string;
}

interface ManifestNpc {
  role: string;
  location: string;
  offers?: string[];
  sells?: string[];
  dialogue_file?: string;
}

interface ManifestEnemy {
  stats: Record<string, number>;
  behavior: string;
  pattern: string[];
  location: string;
  loot: Record<string, number>;
}

interface ManifestLocation {
  type: string;
  npcs?: string[];
  encounters?: string[];
  services?: string[];
  connects_to?: string[];
}

interface ManifestEconomy {
  currency: string;
  income: Record<string, { amount: number; frequency: string; description: string; spawn_chance?: number }>;
  expenses: Record<string, { amount: number; frequency: string; optional?: boolean; auto_draft?: boolean; blocks_reflection?: boolean; description?: string }>;
}

interface ManifestFlag {
  type?: string;
  range?: number[];
  triggers_flip_at?: number;
  set_by?: string;
  checked_by?: string[];
  description?: string;
}

interface Manifest {
  _meta: { description: string; last_updated: string; version: number };
  stats: Record<string, unknown>;
  economy: ManifestEconomy;
  items: Record<string, Record<string, ManifestItem>>;
  npcs: Record<string, ManifestNpc>;
  flags: Record<string, Record<string, ManifestFlag>>;
  enemies: Record<string, ManifestEnemy>;
  locations: Record<string, ManifestLocation>;
  combat: Record<string, unknown>;
  progression: Record<string, unknown>;
}

// --- Main ---
console.log("=== Canon Validation ===");
console.log(`Manifest: ${manifestPath}`);
console.log("");

// 1. Check manifest exists
if (!fs.existsSync(manifestPath)) {
  console.log(`ERROR: Manifest not found: ${manifestPath}`);
  process.exit(1);
}

// 2. Validate JSON structure
console.log("--- Manifest Structure ---");
let manifest: Manifest;
try {
  const raw = fs.readFileSync(manifestPath, "utf-8");
  manifest = JSON.parse(raw) as Manifest;
} catch (e) {
  const msg = e instanceof SyntaxError ? e.message : String(e);
  error(`Manifest is not valid JSON: ${msg}`);
  console.log("");
  console.log("=== VALIDATION FAILED (manifest unreadable) ===");
  process.exit(1);
}
ok("Manifest is valid JSON");
console.log("");

// 3. Check NPC dialogue files exist
console.log("--- Dialogue Files ---");
const dialogueFiles: string[] = [];
for (const [, npc] of Object.entries(manifest.npcs ?? {})) {
  if (npc.dialogue_file) {
    dialogueFiles.push(npc.dialogue_file);
  }
}

if (dialogueFiles.length > 0) {
  for (const dfile of dialogueFiles) {
    const inkPath = path.join(DIALOGUE_DIR, dfile);
    const jsonPath = path.join(DIALOGUE_DIR, dfile.replace(/\.ink$/, ".ink.json"));
    if (fs.existsSync(inkPath) || fs.existsSync(jsonPath)) {
      ok(`Dialogue file exists: ${dfile}`);
    } else {
      warn(`Dialogue file missing: ${dfile} (expected at ${inkPath})`);
    }
  }
} else {
  ok("No dialogue files referenced in manifest");
}
console.log("");

// 4. Check ink files for price consistency
console.log("--- Price Consistency ---");
const inkFiles: string[] = [];
if (fs.existsSync(DIALOGUE_DIR)) {
  for (const f of fs.readdirSync(DIALOGUE_DIR)) {
    if (f.endsWith(".ink")) {
      inkFiles.push(path.join(DIALOGUE_DIR, f));
    }
  }
}

// Collect item prices
const itemPrices: { name: string; price: number }[] = [];
for (const category of ["weapons", "armor"]) {
  const items = manifest.items?.[category] ?? {};
  for (const [name, item] of Object.entries(items)) {
    if (item.price > 0) {
      itemPrices.push({ name, price: item.price });
    }
  }
}

// Collect economy amounts for price checking
const economyAmounts: { name: string; amount: number }[] = [];
for (const [name, src] of Object.entries(manifest.economy?.income ?? {})) {
  economyAmounts.push({ name, amount: src.amount });
}
for (const [name, exp] of Object.entries(manifest.economy?.expenses ?? {})) {
  economyAmounts.push({ name, amount: exp.amount });
}

if (inkFiles.length > 0 && (itemPrices.length > 0 || economyAmounts.length > 0)) {
  for (const inkFile of inkFiles) {
    const content = fs.readFileSync(inkFile, "utf-8");
    const basename = path.basename(inkFile);

    // Check item prices
    for (const { name, price } of itemPrices) {
      const readableName = name.replace(/_/g, " ");
      const regex = new RegExp(readableName, "gi");
      if (!regex.test(content)) continue;

      // Find lines mentioning this item, then look for silver amounts
      const lines = content.split("\n");
      for (const line of lines) {
        if (!new RegExp(readableName, "i").test(line)) continue;
        const silverMatches = line.match(/(\d+)\s*silver/gi);
        if (!silverMatches) continue;
        for (const match of silverMatches) {
          const foundPrice = parseInt(match, 10);
          if (foundPrice !== price) {
            error(`Price mismatch in ${basename}: '${readableName}' says ${foundPrice} silver, manifest says ${price}`);
          }
        }
      }
    }

    // Check economy amounts mentioned in dialogue
    for (const { name, amount } of economyAmounts) {
      const readableName = name.replace(/_/g, " ");
      const lines = content.split("\n");
      for (const line of lines) {
        if (!new RegExp(readableName, "i").test(line)) continue;
        const silverMatches = line.match(/(\d+)\s*silver/gi);
        if (!silverMatches) continue;
        for (const match of silverMatches) {
          const foundAmount = parseInt(match, 10);
          if (foundAmount !== amount) {
            warn(`Economy amount mismatch in ${basename}: '${readableName}' says ${foundAmount} silver, manifest says ${amount}`);
          }
        }
      }
    }
  }
  ok("Price check complete (checked ink files against manifest)");
} else {
  ok("No ink files or prices to check");
}
console.log("");

// 5. Check for unknown flags in ink files
console.log("--- Flag Consistency ---");
const manifestFlags = new Set<string>();
for (const category of Object.values(manifest.flags ?? {})) {
  for (const flagName of Object.keys(category)) {
    manifestFlags.add(flagName);
  }
}

if (inkFiles.length > 0) {
  const allInkVars = new Set<string>();
  for (const inkFile of inkFiles) {
    const content = fs.readFileSync(inkFile, "utf-8");
    // Match {variable_name} interpolation
    const matches = content.matchAll(/\{([a-z_][a-z_0-9]*)\}/g);
    for (const m of matches) {
      allInkVars.add(m[1]);
    }
    // Match VAR declarations
    const varDecls = content.matchAll(/^VAR\s+([a-z_][a-z_0-9]*)\s*=/gm);
    for (const m of varDecls) {
      allInkVars.add(m[1]);
    }
  }

  for (const v of allInkVars) {
    if (!manifestFlags.has(v)) {
      warn(`Ink variable '${v}' not found in manifest flags (may be ink-internal)`);
    }
  }
  ok("Flag check complete");
} else {
  ok("No ink files to check");
}
console.log("");

// 6. Cross-reference locations and NPCs
console.log("--- Location/NPC Cross-Reference ---");
const locations = manifest.locations ?? {};
const npcs = manifest.npcs ?? {};
const enemies = manifest.enemies ?? {};

// Check that NPCs referenced in locations exist
for (const [locName, loc] of Object.entries(locations)) {
  for (const npcName of loc.npcs ?? []) {
    if (!(npcName in npcs)) {
      error(`Location "${locName}" references NPC "${npcName}" which is not defined`);
    }
  }
}

// Check that NPC locations exist
for (const [npcName, npc] of Object.entries(npcs)) {
  if (npc.location && !(npc.location in locations)) {
    error(`NPC "${npcName}" is at location "${npc.location}" which is not defined`);
  }
}

// Check that items sold by NPCs exist
for (const [npcName, npc] of Object.entries(npcs)) {
  for (const itemName of npc.sells ?? []) {
    let found = false;
    for (const category of ["weapons", "armor"]) {
      if (itemName in (manifest.items?.[category] ?? {})) {
        found = true;
      }
    }
    // Also check economy expenses
    if (itemName in (manifest.economy?.expenses ?? {})) {
      found = true;
    }
    if (!found) {
      warn(`NPC "${npcName}" sells "${itemName}" which is not in items or expenses`);
    }
  }
}

// Check enemy locations
for (const [enemyName, enemy] of Object.entries(enemies)) {
  if (enemy.location && !(enemy.location in locations)) {
    error(`Enemy "${enemyName}" is at location "${enemy.location}" which is not defined`);
  }
}

// Check location encounters reference defined enemies
for (const [locName, loc] of Object.entries(locations)) {
  for (const enc of loc.encounters ?? []) {
    if (!(enc in enemies)) {
      error(`Location "${locName}" has encounter "${enc}" which is not defined as an enemy`);
    }
  }
}

// Check location connects_to references
for (const [locName, loc] of Object.entries(locations)) {
  for (const target of loc.connects_to ?? []) {
    if (!(target in locations)) {
      error(`Location "${locName}" connects to "${target}" which is not defined`);
    }
  }
}

if (errors === 0 && warnings === 0) {
  ok("All cross-references valid");
}
console.log("");

// --- Summary ---
const parts: string[] = [];
if (errors > 0) parts.push(`${errors} error${errors !== 1 ? "s" : ""}`);
if (warnings > 0) parts.push(`${warnings} warning${warnings !== 1 ? "s" : ""}`);
const summary = parts.length > 0 ? parts.join(", ") + " " : "";

console.log(`=== CANON VALIDATION ${summary}===`);
if (errors > 0) {
  console.log("=== VALIDATION FAILED ===");
  process.exit(1);
} else {
  console.log("=== VALIDATION PASSED ===");
  process.exit(0);
}
