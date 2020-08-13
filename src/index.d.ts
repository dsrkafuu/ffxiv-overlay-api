export as namespace OverlayAPI;

export = OverlayAPI;

declare class OverlayAPI {
  constructor(options?: OverlayAPI.Options);
  addListener(event: string, cb: (data: object) => any): void;
  removeListener(event: string, cb: (data: object) => any): void;
  removeAllListener(event: string): void;
  listListener(event: string): ((data: object) => any)[];
  endEncounter(): void;
  simulateData(status: boolean): void;
  call(msg: object): Promise<object>;
}

declare namespace OverlayAPI {
  export interface Options {
    liteMode?: boolean;
    simulateData?: boolean;
  }
}
