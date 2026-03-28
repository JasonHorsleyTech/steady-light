// ── Stat Names ──────────────────────────────────────────────

/** The real stats, revealed after reflection flips */
export enum RealStat {
  Drive = 'drive',
  Insight = 'insight',
  Stability = 'stability',
}

/** The false/display stats shown before flips */
export enum FalseStat {
  Calm = 'calm',
  Confidence = 'confidence',
  Passion = 'passion',
}

// ── Scenes & Locations ──────────────────────────────────────

export enum LocationId {
  Farm = 'farm',
  FarmField = 'farm_field',
  WeaponShop = 'weapon_shop',
  ArmorShop = 'armor_shop',
  FightersGuild = 'fighters_guild',
  Bar = 'bar',
  Bank = 'bank',
  TownSquare = 'town_square',
}

export enum LocationType {
  Interior = 'interior',
  Outdoor = 'outdoor',
}

// ── Combat ──────────────────────────────────────────────────

export enum CombatAction {
  Move = 'move',
  Attack = 'attack',
  Block = 'block',
  Dodge = 'dodge',
}

export enum CombatPhase {
  Planning = 'planning',
  Execution = 'execution',
}

export enum CombatStage {
  /** Turn-based illusion, single energy bar */
  Stage0 = 0,
  /** Stat separation — energy splits into 3 bars */
  Stage1 = 1,
  /** Plan awareness — see enemy next action type */
  Stage2 = 2,
  /** Environmental reality — fights in overworld */
  Stage3 = 3,
  /** Fluid motion — move+act on same beat */
  Stage4 = 4,
  /** The truth — odd meters, full reactive AI */
  Stage5 = 5,
}

// ── Direction ───────────────────────────────────────────────

export enum Direction {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
}

// ── Game Phases ─────────────────────────────────────────────

export enum GamePhase {
  CharacterCreation = 'character_creation',
  Exploration = 'exploration',
  Combat = 'combat',
  Dialogue = 'dialogue',
  Shopping = 'shopping',
  Rest = 'rest',
  Reflection = 'reflection',
}

// ── Day Phases ──────────────────────────────────────────────

export enum DayPhase {
  Morning = 'morning',
  Afternoon = 'afternoon',
  Evening = 'evening',
  Night = 'night',
}

// ── NPCs ────────────────────────────────────────────────────

export enum NpcId {
  Farmer = 'farmer',
  Weaponsmith = 'weaponsmith',
  Armorer = 'armorer',
  GuildMaster = 'guild_master',
  Bartender = 'bartender',
  Banker = 'banker',
}

export enum NpcRole {
  Benefactor = 'benefactor',
  Vendor = 'vendor',
  Trainer = 'trainer',
}

// ── Items ───────────────────────────────────────────────────

export enum WeaponId {
  Stick = 'stick',
  ShortSword = 'short_sword',
  HeavyBlade = 'heavy_blade',
}

export enum ArmorId {
  None = 'none',
  LightArmor = 'light_armor',
  HeavyArmor = 'heavy_armor',
}

// ── Enemies ─────────────────────────────────────────────────

export enum EnemyId {
  GreenSlime = 'green_slime',
}

export enum EnemyBehavior {
  PassiveUntilHit = 'passive_until_hit',
}

// ── Economy ─────────────────────────────────────────────────

export enum IncomeSource {
  FarmChores = 'farm_chores',
  SlimeClearing = 'slime_clearing',
  SideJobs = 'side_jobs',
}

export enum ExpenseType {
  BarnRent = 'barn_rent',
  BarDrink = 'bar_drink',
  GuildMembership = 'guild_membership',
  BankAccountFee = 'bank_account_fee',
  BankOverdraft = 'bank_overdraft',
}

export enum IncomeFrequency {
  Daily = 'daily',
  PerSlime = 'per_slime',
}

export enum ExpenseFrequency {
  Daily = 'daily',
  Nightly = 'nightly',
  Weekly = 'weekly',
  OnOverdraft = 'on_overdraft',
}
