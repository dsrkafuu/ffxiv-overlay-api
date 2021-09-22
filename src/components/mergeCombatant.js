/**
 * common number adds
 * @param {...number} args
 * @returns {number}
 */
function addNumber(...args) {
  if (!args.length) {
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < args.length; i++) {
    sum += args[i] || 0;
  }
  return sum;
}

/**
 * damagePct, healsPct, etc.
 * @param {...string} args
 * @returns {string}
 */
function addPct(...args) {
  if (!args.length) {
    return '0%';
  }
  let sum = 0;
  for (let i = 0; i < args.length; i++) {
    const exp = /([0-9]+)%/gi.exec(args[i]);
    if (exp && exp[1]) {
      sum += Number.parseInt(exp[1]) || 0;
    }
  }
  return `${sum}%`;
}

/**
 * directHitPct, critHitPct, etc.
 * @param {...{ hits: number, totalHits: number }} args
 * @returns { hits: number, hitPct: string }
 */
function mergeHitPct(...args) {
  if (!args.length) {
    return { hits: 0, hitPct: '0%' };
  }
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < args.length; i++) {
    numerator += args[i].hits || 0;
    denominator += args[i].totalHits || 0;
  }
  if (denominator === 0 || numerator === 0) {
    return { hits: 0, hitPct: '0%' };
  }
  return {
    hits: numerator,
    hitPct: `${Math.round((numerator / denominator) * 100)}%`,
  };
}

/**
 * @param {...string} args
 * @returns {string}
 */
function mergeOverHealPct(...args) {
  if (!args.length) {
    return '0%';
  }
  let tsum = 0;
  let tnum = 0;
  for (let i = 0; i < args.length; i++) {
    const exp = /([0-9]+)%/gi.exec(args[i]);
    if (exp && exp[1]) {
      const num = Number.parseInt(exp[1]) || 0;
      if (num > 0) {
        tsum += num;
        tnum++;
      }
    }
  }
  if (tnum === 0) {
    return '0%';
  }
  return `${Math.round(tsum / tnum)}%`;
}

/**
 * maxHit, maxHeal, etc.
 * @param {...{ hit: string, hitDamage: number }} args
 * @returns { hit: string, hitDamage: number }
 */
function mergeMax(...args) {
  if (!args.length) {
    return { hit: '', hitDamage: 0 };
  }
  let max = { hit: '', hitDamage: 0 };
  for (let i = 0; i < args.length; i++) {
    if (args[i].hitDamage > max.hitDamage) {
      max = args[i];
    }
  }
  return max;
}

/**
 * @param {...CombatantData} args
 */
export function mergeCombatant(...args) {
  if (!args.length) {
    return null;
  }

  const dps = [];
  const last10DPS = [];
  const last30DPS = [];
  const last60DPS = [];
  const hps = [];

  const swings = [];
  const hits = [];
  const deaths = [];

  const direct = [];
  const crit = [];
  const directCrit = [];

  const damage = [];
  const damageTaken = [];
  const damagePct = [];

  const healed = [];
  const healsTaken = [];
  const healsPct = [];
  const overHeal = [];
  const overHealPct = [];

  const maxHit = [];
  const maxHeal = [];

  args.forEach((item) => {
    dps.push(item.dps);
    last10DPS.push(item.last10DPS);
    last30DPS.push(item.last30DPS);
    last60DPS.push(item.last60DPS);
    hps.push(item.hps);

    swings.push(item.swings);
    hits.push(item.hits);
    deaths.push(item.deaths);

    direct.push({ hits: item.directHits, totalHits: item.hits });
    crit.push({ hits: item.critHits, totalHits: item.hits });
    directCrit.push({ hits: item.directCritHits, totalHits: item.hits });

    damage.push(item.damage);
    damageTaken.push(item.damageTaken);
    damagePct.push(item.damagePct);

    healed.push(item.healed);
    healsTaken.push(item.healsTaken);
    healsPct.push(item.healsPct);
    overHeal.push(item.overHeal);
    overHealPct.push(item.overHealPct);

    maxHit.push({ hit: item.maxHit, hitDamage: item.maxHitDamage });
    maxHeal.push({ hit: item.maxHeal, hitDamage: item.maxHealDamage });
  });

  const ret = {
    name: args[0].name,

    job: args[0].job,
    jobType: args[0].jobType,

    dps: addNumber(...dps),
    last10DPS: addNumber(...last10DPS),
    last30DPS: addNumber(...last30DPS),
    last60DPS: addNumber(...last60DPS),
    hps: addNumber(...hps),

    swings: addNumber(...swings),
    hits: addNumber(...hits),
    deaths: addNumber(...deaths),

    damage: addNumber(...damage),
    damageTaken: addNumber(...damageTaken),
    damagePct: addPct(...damagePct),

    healed: addNumber(...healed),
    healsTaken: addNumber(...healsTaken),
    healsPct: addPct(...healsPct),
    overHeal: addNumber(...overHeal),
    overHealPct: mergeOverHealPct(...overHealPct),
  };

  let temp = mergeHitPct(...direct);
  ret.directHits = temp.hits;
  ret.directHitPct = temp.hitPct;
  temp = mergeHitPct(...crit);
  ret.critHits = temp.hits;
  ret.critHitPct = temp.hitPct;
  temp = mergeHitPct(...directCrit);
  ret.directCritHits = temp.hits;
  ret.directCritHitPct = temp.hitPct;

  temp = mergeMax(...maxHit);
  ret.maxHit = temp.hit;
  ret.maxHitDamage = temp.hitDamage;
  temp = mergeMax(...maxHeal);
  ret.maxHeal = temp.hit;
  ret.maxHealDamage = temp.hitDamage;

  return ret;
}
