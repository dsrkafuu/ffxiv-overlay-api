/**
 * parse job type
 */
function parseJob(jobName) {
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
function parsePlayer(data) {
  let [maxHit, maxHitDamage] = ['', 0];
  const maxHitData = data.maxhit.split('-');
  if (maxHitData.length > 1) {
    maxHit = maxHitData[0];
    maxHitDamage = Number.parseInt(maxHitData[1]);
  }
  let [maxHeal, maxHealDamage] = ['', 0];
  const maxHealData = data.maxheal.split('-');
  if (maxHealData.length > 1) {
    maxHeal = maxHealData[0];
    maxHealDamage = Number.parseInt(maxHealData[1]);
  }

  return {
    name: data.name,

    job: data.Job.toLowerCase(),
    jobType: parseJob(data.Job),

    dps: Number.parseInt(data.encdps),
    last10DPS: Number.parseInt(data.Last10DPS),
    last30DPS: Number.parseInt(data.Last30DPS),
    last60DPS: Number.parseInt(data.Last60DPS),
    hps: Number.parseInt(data.enchps),

    swings: Number.parseInt(data.swings),
    hits: Number.parseInt(data.hits),
    deaths: Number.parseInt(data.deaths),

    directHits: Number.parseInt(data.DirectHitCount),
    directHitPct: data.DirectHitPct || '',
    critHits: Number.parseInt(data.crithits),
    critHitPct: data['crithit%'] || '',
    directCritHits: Number.parseInt(data.CritDirectHitCount),
    directCritHitPct: data.CritDirectHitPct || '',

    damage: Number.parseInt(data.damage),
    damageTaken: Number.parseInt(data.damagetaken),
    damagePct: data['damage%'] || '',

    healed: Number.parseInt(data.healed),
    healsTaken: Number.parseInt(data.healstaken),
    healsPct: data['healed%'] || '',
    overHeal: Number.parseInt(data.overHeal),
    overHealPct: data.OverHealPct || '',

    maxHit,
    maxHitDamage,
    maxHeal,
    maxHealDamage,
  };
}

/**
 * parse encounter data
 */
function parseEncounter(data) {
  return {
    duration: data.duration || '',
    durationSeconds: Number.parseInt(data.DURATION),
    zoneName: data.CurrentZoneName || '',

    dps: Number.parseInt(data.encdps),
    last10DPS: Number.parseInt(data.Last10DPS),
    last30DPS: Number.parseInt(data.Last30DPS),
    last60DPS: Number.parseInt(data.Last60DPS),
    hps: Number.parseInt(data.enchps),

    damage: Number.parseInt(data.damage),
    healed: Number.parseInt(data.healed),
  };
}

/**
 * parse LB data
 */
function parseLimitBreak(data) {
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

    dps: Number.parseInt(data.encdps),
    hps: Number.parseInt(data.enchps),

    damage: Number.parseInt(data.damage),
    healed: Number.parseInt(data.healed),

    maxHit,
    maxHeal,
  };
}

/**
 * inject extended data
 */
export function extendData(data, seperateLB) {
  if (data.type === 'CombatData') {
    // common data
    const parsedData = {
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
        const cbt = parseLimitBreak(data.Combatant[key]);
        if (!Number.isNaN(cbt.dps) && !Number.isNaN(cbt.hps)) {
          seperateLB ? (parsedData.limitBreak = cbt) : parsedData.combatant.push(cbt);
        }
      } else {
        const cbt = parsePlayer(data.Combatant[key]);
        if (!Number.isNaN(cbt.dps) && !Number.isNaN(cbt.hps)) {
          parsedData.combatant.push(cbt);
        }
      }
    });

    data.extendData = parsedData;
  }
  return data;
}
