/*! ffxiv-overlay-plugin | DSRKafuU (https://dsrkafuu.net) | Copyright (c) MIT License */

/* source `common.js` 4a00a65 */
/* https://github.com/ngld/OverlayPlugin/commits/master/docs/assets/shared/common.js */

import OverlayAPI from './overlay';

window.OverlayAPI = OverlayAPI;
export { OverlayAPI };
export default OverlayAPI;

export { default as mergeCombatant } from './modules/mergeCombatant';
export { default as isCEFSharp } from './modules/isCEFSharp';

export type {
  JobType,
  EncounterData,
  LimitBreakData,
  CombatantData,
  ExtendData,
  EventType,
  EventData,
  EventCallback,
} from './types';
