'use strict';

export default {
  data: {
    callback: (data) => {
      console.log(data);
    },
    options: {
      // Strings
      title: {},
      zone: {},
      name: {},
      job: {},
      jobType: {},
      duration: {
        type: 'minutes' || 'seconds',
      },
      maxHitTitle: {},
      maxHealTitle: {},
      // Pure numbers
      damage: { length: 5, pad: false },
      damageTaken: { length: 5, pad: false },
      dps: { length: 5, pad: false, decimal: 0 },
      last10DPS: { length: 5, pad: false, decimal: 0 },
      last30DPS: { length: 5, pad: false, decimal: 0 },
      last60DPS: { length: 5, pad: false, decimal: 0 },
      hits: { length: false, pad: false },
      swings: { length: false, pad: false },
      directHit: { length: false, pad: false },
      critHit: { length: false, pad: false },
      maxHit: { length: false, pad: false },
      healed: { length: 5, pad: false },
      overHeal: { length: 5, pad: false },
      healsTaken: { length: 5, pad: false },
      hps: { length: 5, pad: false, decimal: 0 },
      critHeal: { length: false, pad: false },
      maxHeal: { length: false, pad: false },
      kill: { length: false, pad: false },
      death: { length: false, pad: false },
      // Percentage
      damagePit: { decimal: 0 },
      directHitPit: { decimal: 0 },
      critHitPit: { decimal: 0 },
      critHealPit: { decimal: 0 },
      overHealPit: { decimal: 0 },
    },
  },
  events: [
    {
      event: '',
      callback: () => {},
    },
  ],
  rawMode: false,
  mockMode: false,
};
