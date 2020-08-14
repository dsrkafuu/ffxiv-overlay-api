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

  if (dps.includes(jobName)) {
    return 'dps';
  }
  if (heal.includes(jobName)) {
    return 'heal';
  }
  if (tank.includes(jobName)) {
    return 'tank';
  }
  return jobName;
}

export default function parseData(data) {
  if (data.type === 'CombatData') {
    // Generate parsed data
    const {
      damage,
      encdps,
      duration,
      healed,
      enchps,
      Last10DPS,
      Last30DPS,
      Last60DPS,
      CurrentZoneName,
    } = data.Encounter;

    const parsedData = {
      isActive: data.isActive,
      encounter: {
        damage,
        dps: encdps,
        duration,
        healed,
        hps: enchps,
        last10Dps: Last10DPS,
        last30Dps: Last30DPS,
        last60Dps: Last60DPS,
        zoneName: CurrentZoneName,
      },
      combatant: {},
    };

    for (let key in data.Combatant) {
      if (key === 'Limit Break') {
        let [maxHeal, maxHit] = new Array(2).fill(null);
        const maxHealData = data.Combatant[key].maxheal.split('-');
        const maxHitData = data.Combatant[key].maxhit.split('-');
        if (maxHealData.length > 1) {
          maxHeal = maxHealData[0];
        }
        if (maxHitData.length > 1) {
          maxHit = maxHitData[0];
        }

        const { damage, encdps, healed, enchps } = data.Combatant[key];

        parsedData.combatant[key] = {
          damage,
          dps: encdps,
          healed,
          hps: enchps,
          maxHeal,
          maxHit,
        };
      } else {
        const {
          crithits,
          damage,
          damagetaken,
          DirectHitCount,
          CritDirectHitCount,
          deaths,
          encdps,
          healed,
          healstaken,
          hits,
          enchps,
          Job,
          Last10DPS,
          Last30DPS,
          Last60DPS,
          overHeal,
          swings,
        } = data.Combatant[key];

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
          critHits: crithits,
          damage,
          damageTaken: damagetaken,
          directHits: DirectHitCount,
          directCritHits: CritDirectHitCount,
          deaths,
          dps: encdps,
          healed,
          healsTaken: healstaken,
          hits,
          hps: enchps,
          job: Job.toLowerCase(),
          jobType: parseJob(Job),
          last10Dps: Last10DPS,
          last30Dps: Last30DPS,
          last60Dps: Last60DPS,
          overHeal,
          swings,
          maxHeal,
          maxHealDamage,
          maxHit,
          maxHitDamage,
        };
      }
    }

    return parsedData;
  } else {
    return data;
  }
}
