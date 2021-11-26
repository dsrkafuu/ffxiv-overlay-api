/*! ffxiv-overlay-plugin TS declaration | DSRKafuU (https://dsrkafuu.net) | Copyright (c) MIT License */

export interface OverlayOptions {
  extendData?: boolean;
  silentMode?: boolean;
  seperateLB?: boolean;
}

export interface EncounterData {
  duration: string;
  durationSeconds: number;
  zoneName: string;
  dps: number;
  last10DPS: number;
  last30DPS: number;
  last60DPS: number;
  hps: number;
  damage: number;
  healed: number;
}

export interface LimitBreakData {
  name: 'Limit Break';
  dps: number;
  hps: number;
  damage: number;
  healed: number;
  maxHit: string;
  maxHeal: string;
}

export interface CombatantData {
  name: string;
  job: string;
  jobType: 'dps' | 'healer' | 'tank' | 'hand' | 'land' | 'unknown';
  dps: number;
  last10DPS: number;
  last30DPS: number;
  last60DPS: number;
  hps: number;
  swings: number;
  hits: number;
  deaths: number;
  directHits: number;
  directHitPct: string;
  critHits: number;
  critHitPct: string;
  directCritHits: number;
  directCritHitPct: string;
  damage: number;
  damageTaken: number;
  damagePct: string;
  healed: number;
  healsTaken: number;
  healsPct: string;
  overHeal: number;
  overHealPct: string;
  maxHit: string;
  maxHitDamage: number;
  maxHeal: string;
  maxHealDamage: number;
}

export interface ExtendData {
  isActive: boolean;
  encounter: EncounterData;
  limitBreak?: LimitBreakData;
  combatant: CombatantData[];
}

export type EventType =
  | 'CombatData'
  | 'LogLine'
  | 'ImportedLogLines'
  | 'ChangeZone'
  | 'ChangePrimaryPlayer'
  | 'OnlineStatusChanged'
  | 'PartyChanged'
  | 'BroadcastMessage';

export interface EventMessage {
  type: EventType;
  rseq?: number; // response promises for `callHandler`
  [key: string]: any;
}

export type EventCallback = (msg: EventMessage, ...args: any[]) => any;

export type HandlerType =
  | 'subscribe'
  | 'getLanguage'
  | 'getCombatants'
  | 'saveData'
  | 'loadData'
  | 'say'
  | 'broadcast';

export interface HandlerMessage {
  call: HandlerType;
  rseq?: number; // response promises for `callHandler`
}

// same as above within namespace
declare namespace OverlayAPI {
  export interface OverlayOptions {
    extendData?: boolean;
    silentMode?: boolean;
    seperateLB?: boolean;
  }

  export interface EncounterData {
    duration: string;
    durationSeconds: number;
    zoneName: string;
    dps: number;
    last10DPS: number;
    last30DPS: number;
    last60DPS: number;
    hps: number;
    damage: number;
    healed: number;
  }

  export interface LimitBreakData {
    name: 'Limit Break';
    dps: number;
    hps: number;
    damage: number;
    healed: number;
    maxHit: string;
    maxHeal: string;
  }

  export interface CombatantData {
    name: string;
    job: string;
    jobType: 'dps' | 'healer' | 'tank' | 'hand' | 'land' | 'unknown';
    dps: number;
    last10DPS: number;
    last30DPS: number;
    last60DPS: number;
    hps: number;
    swings: number;
    hits: number;
    deaths: number;
    directHits: number;
    directHitPct: string;
    critHits: number;
    critHitPct: string;
    directCritHits: number;
    directCritHitPct: string;
    damage: number;
    damageTaken: number;
    damagePct: string;
    healed: number;
    healsTaken: number;
    healsPct: string;
    overHeal: number;
    overHealPct: string;
    maxHit: string;
    maxHitDamage: number;
    maxHeal: string;
    maxHealDamage: number;
  }

  export interface ExtendData {
    isActive: boolean;
    encounter: EncounterData;
    limitBreak?: LimitBreakData;
    combatant: CombatantData[];
  }

  export type EventType =
    | 'CombatData'
    | 'LogLine'
    | 'ImportedLogLines'
    | 'ChangeZone'
    | 'ChangePrimaryPlayer'
    | 'OnlineStatusChanged'
    | 'PartyChanged'
    | 'BroadcastMessage';

  export interface EventMessage {
    type: EventType;
    rseq?: number; // response promises for `callHandler`
    [key: string]: any;
  }

  export type EventCallback = (msg: EventMessage, ...args: any[]) => any;

  export type HandlerType =
    | 'subscribe'
    | 'getLanguage'
    | 'getCombatants'
    | 'saveData'
    | 'loadData'
    | 'say'
    | 'broadcast';

  export interface HandlerMessage {
    call: HandlerType;
    rseq?: number; // response promises for `callHandler`
  }
}

// root class
declare class OverlayAPI {
  static mergeCombatant(...args: OverlayAPI.CombatantData[]): OverlayAPI.CombatantData;
  constructor(options: OverlayAPI.OverlayOptions);
  addListener(event: OverlayAPI.EventType, cb: OverlayAPI.EventCallback): void;
  removeListener(event: OverlayAPI.EventType, cb: OverlayAPI.EventCallback): void;
  removeAllListener(event: OverlayAPI.EventType): void;
  getAllListener(event: OverlayAPI.EventType): OverlayAPI.EventCallback[];
  startEvent(): void;
  endEncounter(): Promise<void>;
  callHandler(msg: OverlayAPI.HandlerMessage): Promise<OverlayAPI.EventMessage>;
  simulateData(msg: OverlayAPI.EventMessage): void;
}

// default export
export default OverlayAPI;
