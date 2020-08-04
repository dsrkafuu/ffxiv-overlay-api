export as namespace OverlayAPI;

export = OverlayAPI;

declare class OverlayAPI {
  constructor(events?: OverlayAPI.Events);
  add(event: string, cbs: OverlayAPI.CallbackMixed): void;
  remove(event: string, cb: OverlayAPI.Callback | number): void;
  removeAll(event: string): void;
  list(event: string): OverlayAPI.CallbackArray;
  call(msg: object): Promise<object>;
}

declare namespace OverlayAPI {
  export type Callback = (data: object) => any;
  export type CallbackArray = ((data: object) => any)[];
  export type CallbackMixed = Callback | CallbackArray;

  export interface Events {
    CombatData?: CallbackMixed;
    LogLine?: CallbackMixed;
    ImportedLogLines?: CallbackMixed;
    ChangeZone?: CallbackMixed;
    ChangePrimaryPlayer?: CallbackMixed;
    OnlineStatusChanged?: CallbackMixed;
  }
}
