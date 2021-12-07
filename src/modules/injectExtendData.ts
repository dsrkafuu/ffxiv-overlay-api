import {
  JobType,
  CombatantData,
  EncounterData,
  LimitBreakData,
  EventData,
  ExtendData,
} from '../types';
import { getPctNum } from '../utils/getter';

const toInt = Number.parseInt || window.parseInt || Math.floor;

/**
 * parse job type
 */
function parseJob(jobName: string): JobType {
  jobName = jobName.toLowerCase();

  const dps = [
    // base
    'acn',
    'arc',
    'lnc',
    'pgl',
    'rog',
    'thm',
    // melee
    'drg',
    'mnk',
    'nin',
    'sam',
    'rpr',
    // magical ranged
    'smn',
    'blm',
    'rdm',
    // physical ranged
    'brd',
    'mch',
    'dnc',
    // special
    'blu',
  ];
  const healer = [
    // base
    'cnj',
    // add
    'whm',
    'sch',
    'ast',
    'sge',
  ];
  const tank = [
    // base
    'gla',
    'mrd',
    // add
    'pld',
    'war',
    'drk',
    'gnb',
  ];

  const hand = ['crp', 'bsm', 'arm', 'gsm', 'lwr', 'wvr', 'alc', 'cul'];
  const land = ['bot', 'fsh', 'min'];

  if (dps.includes(jobName)) {
    return 'dps';
  } else if (healer.includes(jobName)) {
    return 'healer';
  } else if (tank.includes(jobName)) {
    return 'tank';
  } else if (hand.includes(jobName)) {
    return 'hand';
  } else if (land.includes(jobName)) {
    return 'land';
  } else {
    return 'unknown';
  }
}

/**
 * parse single player
 */
function parsePlayer(data: any): CombatantData {
  let [maxHit, maxHitDamage] = ['', 0];
  const maxHitData = data.maxhit.split('-');
  if (maxHitData.length > 1) {
    maxHit = maxHitData[0];
    maxHitDamage = toInt(maxHitData[1]);
  }
  let [maxHeal, maxHealDamage] = ['', 0];
  const maxHealData = data.maxheal.split('-');
  if (maxHealData.length > 1) {
    maxHeal = maxHealData[0];
    maxHealDamage = toInt(maxHealData[1]);
  }

  return {
    name: data.name,

    job: data.Job.toLowerCase(),
    jobType: parseJob(data.Job),

    dps: toInt(data.encdps),
    last10DPS: toInt(data.Last10DPS),
    last30DPS: toInt(data.Last30DPS),
    last60DPS: toInt(data.Last60DPS),
    hps: toInt(data.enchps),

    swings: toInt(data.swings),
    hits: toInt(data.hits),
    deaths: toInt(data.deaths),

    directHits: toInt(data.DirectHitCount),
    directHitPct: data.DirectHitPct || '',
    critHits: toInt(data.crithits),
    critHitPct: data['crithit%'] || '',
    directCritHits: toInt(data.CritDirectHitCount),
    directCritHitPct: data.CritDirectHitPct || '',

    damage: toInt(data.damage),
    damageTaken: toInt(data.damagetaken),
    damagePct: data['damage%'] || '',

    healed: toInt(data.healed),
    healsTaken: toInt(data.healstaken),
    healsPct: data['healed%'] || '', // this includes shield pct
    overHeal: toInt(data.overHeal),
    overHealPct: data.OverHealPct || '',
    shield: toInt(data.damageShield),
    shieldPct: `${
      Math.round(
        (toInt(data.damageShield) / toInt(data.healed) || 0) *
          getPctNum(data['healed%'] || '')
      ) || 0
    }%`,

    maxHit,
    maxHitDamage,
    maxHeal,
    maxHealDamage,
  };
}

/**
 * parse encounter data
 */
function parseEncounter(data: any): EncounterData {
  return {
    duration: data.duration || '',
    durationSeconds: toInt(data.DURATION),
    zoneName: data.CurrentZoneName || '',

    dps: toInt(data.encdps),
    last10DPS: toInt(data.Last10DPS),
    last30DPS: toInt(data.Last30DPS),
    last60DPS: toInt(data.Last60DPS),
    hps: toInt(data.enchps),

    damage: toInt(data.damage),
    healed: toInt(data.healed),
    shield: toInt(data.damageShield),
  };
}

/**
 * parse LB data
 */
function parseLimitBreak(data: any): LimitBreakData {
  let maxHit = '';
  const maxHitData = data.maxhit.split('-');
  if (maxHitData.length > 1) {
    maxHit = maxHitData[0];
  }
  let maxHeal = '';
  const maxHealData = data.maxheal.split('-');
  if (maxHealData.length > 1) {
    maxHeal = maxHealData[0];
  }

  return {
    name: 'Limit Break',

    dps: toInt(data.encdps),
    hps: toInt(data.enchps),

    damage: toInt(data.damage),
    healed: toInt(data.healed),
    shield: toInt(data.damageShield),

    maxHit,
    maxHeal,
  };
}

/**
 * inject extended data
 */
function injectExtendData(data: EventData): EventData {
  if (data.type === 'CombatData') {
    // common data
    const parsedData: ExtendData = {
      isActive: data.isActive === 'true' || data.isActive === true,
      encounter: parseEncounter(data.Encounter),
      combatant: [],
    };

    // combatant
    const combatantKeys = Object.keys(data.Combatant);
    const combatantValidKeys = combatantKeys.filter((key) =>
      Object.prototype.hasOwnProperty.call(data.Combatant, key)
    );
    combatantValidKeys.forEach((key) => {
      if (key === 'Limit Break') {
        parsedData.limitBreak = parseLimitBreak(data.Combatant[key]);
      } else {
        parsedData.combatant.push(parsePlayer(data.Combatant[key]));
      }
    });

    data.extendData = parsedData;
  }
  return data;
}

export default injectExtendData;
