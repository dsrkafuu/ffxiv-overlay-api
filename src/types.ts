// api specific types

export interface OverlayOptions {
  extendData?: boolean;
  silentMode?: boolean;
}

export interface ExtendCombatData {
  isActive: boolean;
  encounter: {
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
  };
  combatant:
    | {
        name: 'Limit Break';
        dps: number;
        hps: number;
        damage: number;
        healed: number;
        maxHit: string;
        maxHeal: string;
      }[]
    | {
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
      }[];
}

// event system (received)

export type EventType =
  | 'CombatData'
  | 'LogLine'
  | 'ImportedLogLines'
  | 'ChangeZone'
  | 'ChangePrimaryPlayer'
  | 'OnlineStatusChanged'
  | 'PartyChanged'
  | 'BroadcastMessage';

export type EventCallback = (...args: any[]) => any;

export interface EventCenter {
  CombatData?: Array<EventCallback>;
  LogLine?: Array<EventCallback>;
  ImportedLogLines?: Array<EventCallback>;
  ChangeZone?: Array<EventCallback>;
  ChangePrimaryPlayer?: Array<EventCallback>;
  OnlineStatusChanged?: Array<EventCallback>;
  PartyChanged?: Array<EventCallback>;
  BroadcastMessage?: Array<EventCallback>;
}

// handler system (requested)

export type HandlerType =
  | 'subscribe'
  | 'getLanguage'
  | 'getCombatants'
  | 'saveData'
  | 'loadData'
  | 'say'
  | 'broadcast';

export type HandlerCallback = (...args: any[]) => any;

// types of received message

export interface ResMessage {
  type: EventType;
  rseq?: number; // response promises for `callHandler`
}
export interface CombatDataResMessage extends ResMessage {
  Encounter: any;
  Combatant: any;
  isActive: string | boolean;
  extendData?: ExtendCombatData;
}
export interface LogLineResMessage extends ResMessage {
  line: string[];
  rawLine: string;
}
export interface ImportedLogLinesResMessage extends ResMessage {
  logLines: string[];
}
export interface ChangeZoneResMessage extends ResMessage {
  zoneID: number;
  zoneName: string;
}
export interface ChangePrimaryPlayerResMessage extends ResMessage {
  charID: number;
  charName: string;
}
export interface OnlineStatusChangedResMessage extends ResMessage {
  target: number;
  rawStatus: number;
  status: string;
}
export interface PartyChangedResMessage extends ResMessage {
  id: number;
  name: string;
  worldId: number;
  job: number;
  inParty: boolean;
}
export interface BroadcastMessageResMessage extends ResMessage {
  source: string;
  msg: any;
}

// types of requested message

export interface ReqMessage {
  call: HandlerType;
  rseq?: number; // response promises for `callHandler`
}
export interface SubscribeReqMessage extends ReqMessage {
  events: EventType[];
}

// queued message before api inited

export interface QueueMessage {
  msg: ReqMessage;
  cb?: HandlerCallback;
}

// response promise system

export interface ResponsePromises {
  [key: string]: HandlerCallback; // resq: callback
}
