interface OverlayOptions {
  extendData?: boolean;
  silentMode?: boolean;
  seperateLB?: boolean;
}

interface EncounterData {
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

interface LimitBreakData {
  name: 'Limit Break';
  dps: number;
  hps: number;
  damage: number;
  healed: number;
  maxHit: string;
  maxHeal: string;
}

interface CombatantData {
  name: string;
  job: string;
  jobType: 'dps' | 'heal' | 'tank' | 'others';
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

interface ExtendData {
  isActive: boolean;
  encounter: EncounterData;
  limitBreak?: LimitBreakData;
  combatant: CombatantData[];
}

type EventType =
  | 'CombatData'
  | 'LogLine'
  | 'ImportedLogLines'
  | 'ChangeZone'
  | 'ChangePrimaryPlayer'
  | 'OnlineStatusChanged'
  | 'PartyChanged'
  | 'BroadcastMessage';

interface EventMessage {
  type: EventType;
  rseq?: number; // response promises for `callHandler`
  [key: string]: any;
}

type EventCallback = (msg: EventMessage, ...args: any[]) => any;

type HandlerType =
  | 'subscribe'
  | 'getLanguage'
  | 'getCombatants'
  | 'saveData'
  | 'loadData'
  | 'say'
  | 'broadcast';

interface HandlerMessage {
  call: HandlerType;
  rseq?: number; // response promises for `callHandler`
}

export default class OverlayAPI {
  constructor(options: OverlayOptions);
  addListener(event: EventType, cb: EventCallback): void;
  removeListener(event: EventType, cb: EventCallback): void;
  removeAllListener(event: EventType): void;
  getAllListener(event: EventType): EventCallback[];
  startEvent(): void;
  endEncounter(): Promise<void>;
  callHandler(msg: HandlerMessage): Promise<EventMessage>;
  simulateData(msg: EventMessage): void;
}
