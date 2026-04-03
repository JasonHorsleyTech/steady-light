/**
 * Scans workshop/pixellab/ experiment directories and builds manifest.json
 * for the sprite viewer.
 *
 * Usage: npx tsx workshop/pixellab/build-manifest.ts
 */

import { readdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import type { ManifestExperiment, Manifest } from './types.js';

const BASE = new URL('.', import.meta.url).pathname;

function findPngs(dir: string, base: string = dir): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findPngs(full, base));
    } else if (entry.endsWith('.png')) {
      results.push(relative(base, full));
    }
  }
  return results.sort();
}

function parseExperimentName(dirname: string): string {
  // "003-slime-idle-tiles" → "Slime Idle Tiles"
  return dirname
    .replace(/^\d+-/, '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function parseLogNotes(logPath: string): Map<string, string> {
  const notes = new Map<string, string>();
  if (!existsSync(logPath)) return notes;

  const content = readFileSync(logPath, 'utf-8');
  const sections = content.split(/^## /m).slice(1);

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const header = lines[0]; // e.g. "001 — Slime Humanoid Character"
    const match = header.match(/^(\d+)/);
    if (!match) continue;

    const verdictLine = lines.find(l => l.startsWith('- **Verdict:**'));
    if (verdictLine) {
      notes.set(match[1], verdictLine.replace('- **Verdict:** ', ''));
    }
  }
  return notes;
}

function inferType(dir: string, frames: string[]): ManifestExperiment['type'] {
  const hasRotations = existsSync(join(dir, 'rotations'));
  if (hasRotations) return 'directional';
  const hasFrameSequence = frames.some(f => /frame_\d+\.png$/.test(f));
  if (hasFrameSequence && frames.length > 1) return 'animation';
  return 'static';
}

function buildDirectionMap(frames: string[]): Record<string, string> | undefined {
  const rotationFrames = frames.filter(f => f.startsWith('rotations/'));
  if (rotationFrames.length === 0) return undefined;
  const map: Record<string, string> = {};
  for (const frame of rotationFrames) {
    const direction = frame.replace('rotations/', '').replace('.png', '');
    map[direction] = frame;
  }
  return map;
}

interface ExperimentConfig {
  type?: ManifestExperiment['type'];
  direction_map?: Record<string, string>;
  frame_rate?: number;
  notes?: string;
}

function readExperimentConfig(dir: string): ExperimentConfig {
  const configPath = join(dir, 'config.json');
  if (!existsSync(configPath)) return {};
  return JSON.parse(readFileSync(configPath, 'utf-8')) as ExperimentConfig;
}

// Scan experiment directories
const logNotes = parseLogNotes(join(BASE, 'experiment-log.md'));
const experiments: ManifestExperiment[] = [];

// Read existing manifest to preserve review state
const existingManifestPath = join(BASE, 'manifest.json');
const existingExperiments = new Map<string, ManifestExperiment>();
if (existsSync(existingManifestPath)) {
  const existing = JSON.parse(readFileSync(existingManifestPath, 'utf-8')) as Manifest;
  for (const exp of existing.experiments) {
    existingExperiments.set(exp.id, exp);
  }
}

for (const entry of readdirSync(BASE).sort()) {
  const full = join(BASE, entry);
  if (!statSync(full).isDirectory()) continue;
  if (!/^\d{3}-/.test(entry)) continue;

  const frames = findPngs(full);
  if (frames.length === 0) continue;

  const num = entry.match(/^(\d+)/)![1];
  const config = readExperimentConfig(full);
  const type = config.type ?? inferType(full, frames);

  // Preserve review state from previous manifest
  const prev = existingExperiments.get(entry);

  const experiment: ManifestExperiment = {
    id: entry,
    name: parseExperimentName(entry),
    frames,
    notes: logNotes.get(num) ?? null,
    type,
    status: prev?.status ?? 'unreviewed',
    review_notes: prev?.review_notes ?? null,
  };

  if (config.notes !== undefined) {
    experiment.notes = config.notes;
  }
  if (type === 'directional') {
    experiment.direction_map = config.direction_map ?? buildDirectionMap(frames);
  }
  if (type === 'animation') {
    experiment.frame_rate = config.frame_rate ?? 200;
  }

  experiments.push(experiment);
}

const manifest: Manifest = { generated: new Date().toISOString(), experiments };
const outPath = join(BASE, 'manifest.json');
writeFileSync(outPath, JSON.stringify(manifest, null, 2));

// Summary
const byType = new Map<string, number>();
const byStatus = new Map<string, number>();
for (const exp of experiments) {
  byType.set(exp.type, (byType.get(exp.type) ?? 0) + 1);
  byStatus.set(exp.status, (byStatus.get(exp.status) ?? 0) + 1);
}

console.log(`Wrote ${outPath}`);
console.log(`  ${experiments.length} experiments, ${experiments.reduce((s, e) => s + e.frames.length, 0)} total frames`);
console.log(`  By type: ${[...byType.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`);
console.log(`  By status: ${[...byStatus.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`);
