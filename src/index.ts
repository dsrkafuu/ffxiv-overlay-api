/*! ffxiv-overlay-plugin | DSRKafuU (https://dsrkafuu.net) | Copyright (c) MIT License */

import OverlayAPI from './overlay';

window.OverlayAPI = OverlayAPI;

export { OverlayAPI };
export default OverlayAPI;

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
