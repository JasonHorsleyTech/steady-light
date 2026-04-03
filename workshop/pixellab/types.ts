/**
 * Shared types for PixelLab manifest.
 * Used by build-manifest.ts and the Lightbox review tool.
 */

export interface ManifestExperiment {
  id: string;
  name: string;
  frames: string[];
  notes: string | null;
  type: 'static' | 'directional' | 'animation';
  status: 'unreviewed' | 'approved' | 'rejected' | 'needs-changes';
  review_notes: string | null;
  /** Maps direction name to frame path. Only for directional assets. */
  direction_map?: Record<string, string>;
  /** Playback speed in ms per frame. Only for animations. */
  frame_rate?: number;
}

export interface Manifest {
  generated: string;
  experiments: ManifestExperiment[];
}
