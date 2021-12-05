import OverlayAPI from '.';

declare global {
  interface Window {
    OverlayPluginApi: any;
    dispatchOverlayEvent?: (msg: OverlayData) => void;
    __OverlayCallback: (msg: OverlayData) => void;

    OverlayAPI: typeof OverlayAPI;
  }
}

export {};
