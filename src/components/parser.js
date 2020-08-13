/**
 * Combat data parser for liteMode
 * @param {Object} data Data from OverlayPlugin
 */

function parseJob(jobName) {
  jobName = jobName.toLowerCase();
  const dps = [
    'acn',
    'arc',
    'blm',
    'brd',
    'drg',
    'dnc',
    'lnc',
    'mch',
    'mnk',
    'nin',
    'pgl',
    'pug',
    'rdm',
    'rog',
    'sam',
    'smn',
    'thm',
  ];
  const heal = ['ast', 'cnj', 'sch', 'whm'];
  const tank = ['drk', 'gla', 'gld', 'gnb', 'mrd', 'pld', 'war'];

  switch (jobName) {
    case dps.includes(jobName):
      return 'dps';
    case heal.includes(jobName):
      return 'heal';
    case tank.includes(jobName):
      return 'tank';
    default:
      return jobName;
  }
}

export default function parseData(data) {
  if (data.type === 'CombatData') {
    // Generate parsed data
    const parsedData = {
      isActive: data.isActive,
      encounter: {
        damage: data.Encounter.damage,
        dps: data.Encounter.encdps,
        duration: data.Encounter.duration,
        healed: data.Encounter.healed,
        hps: data.Encounter.enchps,
        last10Dps: data.Encounter.Last10DPS,
        last30Dps: data.Encounter.Last30DPS,
        last60Dps: data.Encounter.Last60DPS,
        zoneName: data.Encounter.CurrentZoneName,
      },
      combatant: {},
    };

    for (let key in data.Combatant) {
      let [maxHeal, maxHealDamage, maxHit, maxHitDamage] = new Array(4).fill(null);
      const maxHealData = data.Combatant[key].maxheal.split('-');
      const maxHitData = data.Combatant[key].maxhit.split('-');
      if (maxHealData.length > 1) {
        maxHeal = maxHealData[0];
        maxHealDamage = maxHealData[1];
      }
      if (maxHitData.length > 1) {
        maxHit = maxHitData[0];
        maxHitDamage = maxHitData[1];
      }

      parsedData.combatant[key] = {
        critHits: data.Combatant[key].crithits,
        damage: data.Combatant[key].damage,
        damageTaken: data.Combatant[key].damagetaken,
        directHits: data.Combatant[key].DirectHitCount,
        directCritHits: data.Combatant[key].CritDirectHitCount,
        deaths: data.Combatant[key].deaths,
        dps: data.Combatant[key].encdps,
        healed: data.Combatant[key].healed,
        healsTaken: data.Combatant[key].healstaken,
        hits: data.Combatant[key].hits,
        hps: data.Combatant[key].enchps,
        job: data.Combatant[key].Job.toLowerCase(),
        jobType: parseJob(data.Combatant[key].Job),
        last10Dps: data.Combatant[key].Last10DPS,
        last30Dps: data.Combatant[key].Last30DPS,
        last60Dps: data.Combatant[key].Last60DPS,
        overHeal: data.Combatant[key].overHeal,
        swings: data.Combatant[key].swings,
        maxHeal,
        maxHealDamage,
        maxHit,
        maxHitDamage,
      };
    }

    return parsedData;
  } else {
    return data;
  }
}
