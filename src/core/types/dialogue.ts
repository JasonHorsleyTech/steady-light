import type { NpcId } from './enums';

export interface DialogueChoice {
  text: string;
  /** The ink knot/stitch this choice leads to */
  target: string;
  /** Whether this choice is available (e.g., gated by flags) */
  available: boolean;
  tags?: string[];
}

export interface DialogueLine {
  text: string;
  speaker: NpcId | 'narrator' | 'player';
  tags?: string[];
}

export interface DialogueState {
  active: boolean;
  currentLine: DialogueLine | null;
  choices: DialogueChoice[];
  speaker: NpcId | 'narrator' | 'player' | null;
  /** Current ink knot path */
  currentKnot: string | null;
  /** History of visited knots for tracking branching */
  knotHistory: string[];
  /** The .ink file driving this conversation */
  dialogueFile: string | null;
}
