export as namespace OverlayAPI;

export = OverlayAPI;

declare class OverlayAPI {
  constructor(events?: OverlayAPI.Events);
  add(event: string, cbs: ((data: object) => any) | ((data: object) => any)[]): void;
  remove(event: string, cb: ((data: object) => any) | number): void;
  removeAll(event: string): void;
  list(event: string): ((data: object) => any)[];
  call(msg: object): Promise<object>;
}

declare namespace OverlayAPI {
  export interface Events {
    CombatData?: ((data: object) => any) | ((data: object) => any)[];
    LogLine?: ((data: object) => any) | ((data: object) => any)[];
    ImportedLogLines?: ((data: object) => any) | ((data: object) => any)[];
    ChangeZone?: ((data: object) => any) | ((data: object) => any)[];
    ChangePrimaryPlayer?: ((data: object) => any) | ((data: object) => any)[];
    OnlineStatusChanged?: ((data: object) => any) | ((data: object) => any)[];
  }
}
