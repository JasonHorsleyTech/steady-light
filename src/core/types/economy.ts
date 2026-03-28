import type {
  ArmorId,
  ExpenseFrequency,
  ExpenseType,
  IncomeFrequency,
  IncomeSource,
  WeaponId,
} from './enums';

// ── Items ───────────────────────────────────────────────────

export interface WeaponDefinition {
  id: WeaponId;
  price: number;
  damageMultiplier: number;
  beatsPerAttack: number;
  description: string;
  shopDescription?: string;
}

export interface ArmorDefinition {
  id: ArmorId;
  price: number;
  damageReduction: number;
  movementCost: number;
  description?: string;
  shopDescription?: string;
}

// ── Income & Expenses ───────────────────────────────────────

export interface IncomeDefinition {
  source: IncomeSource;
  amount: number;
  frequency: IncomeFrequency;
  spawnChance?: number;
  description: string;
}

export interface ExpenseDefinition {
  type: ExpenseType;
  amount: number;
  frequency: ExpenseFrequency;
  autoDraft: boolean;
  optional: boolean;
  blocksReflection?: boolean;
  description?: string;
}

// ── Transactions & Ledger ───────────────────────────────────

export interface Transaction {
  source: IncomeSource | ExpenseType | string;
  amount: number;
  day: number;
  description: string;
}

export interface DailyLedger {
  day: number;
  income: Transaction[];
  expenses: Transaction[];
  openingBalance: number;
  closingBalance: number;
}

// ── Economy State ───────────────────────────────────────────

export interface EconomyState {
  silver: number;
  transactions: Transaction[];
  currentDay: number;
}
