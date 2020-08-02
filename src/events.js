'use strict';

export default {
  CombatData: [
    (data) => {
      console.log(data.type);
    },
    (data) => {
      console.log(data.isActive);
    },
  ],
  LogLine: null,
  ImportedLogLines: null,
  ChangeZone: (data) => {
    console.log(data.type);
  },
  ChangePrimaryPlayer: null,
  OnlineStatusChanged: null,
};
