import OverlayAPI from '.';

declare global {
  interface Window {
    OverlayPluginApi: {
      callHandler(msg: string, cb?: (...args: any[]) => void): Promise<void>;
      endEncounter(...args: any[]): Promise<void>;
      ready: boolean;
    };
    __OverlayCallback(...args: any[]): void;
    dispatchOverlayEvent(...args: any[]): void;
    OverlayAPI: typeof OverlayAPI;
  }
}

export {};
