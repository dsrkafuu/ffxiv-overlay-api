export as namespace OverlayAPI;

export = OverlayAPI;

declare class OverlayAPI {
  constructor(options?: OverlayAPI.Options);
  addListener(event: string, cb: function): void;
  removeListener(event: string, cb: function): void;
  removeAllListener(event: string): void;
  listAllListener(event: string): function[];
  startEvent(): void;
  endEncounter(): void;
  callHandler(msg: object): Promise;
  simulateData(fakeData: object | undefined): void;
}

declare namespace OverlayAPI {
  export interface Options {
    extend?: boolean;
  }
}
