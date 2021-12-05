/*! ffxiv-overlay-plugin | DSRKafuU (https://dsrkafuu.net) | Copyright (c) MIT License */

import OverlayAPI from './overlay';

window.OverlayAPI = OverlayAPI;

export { OverlayAPI };
export default OverlayAPI;

export type {
  OverlayOptions,
  EncounterData,
  LimitBreakData,
  CombatantData,
  ExtendData,
  EventType,
  EventMessage,
  EventCallback,
  HandlerType,
  HandlerMessage,
  JobType,
} from './types';
