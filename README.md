# 🗡 ffxiv-overlay-api 🛡

![BADGE](https://img.shields.io/github/workflow/status/dsrkafuu/ffxiv-overlay-api/npm-publish)
![BADGE](https://img.shields.io/npm/v/ffxiv-overlay-api)
![BADGE](https://img.shields.io/npm/dm/ffxiv-overlay-api)
![BADGE](https://img.shields.io/npm/l/ffxiv-overlay-api)

Build your own modern FFXIV overlay with npm & TypeScript support.

This library needs to be used along with [ngld/OverlayPlugin](https://github.com/ngld/OverlayPlugin).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [API](#api)
- [Development](#development)
- [Contributon](#contributon)
- [Annotations](#annotations)

## Installation

You can install it from [npm registry](https://www.npmjs.com/package/ffxiv-overlay-api):

```bash
npm install ffxiv-overlay-api --save
```

Or import the library from jsDelivr CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/ffxiv-overlay-api@4/lib/overlay.min.js"></script>
<script>
  const overlay = new window.OverlayAPI();
</script>
```

## Usage

After installation, you can import the library:

```js
import OverlayAPI from 'ffxiv-overlay-api';
import { OverlayAPI } from 'ffxiv-overlay-api'; // also works
const overlay = new OverlayAPI();

// use static tool functions directly
OverlayAPI.isCEFSharp();
// import tool functions
import { isCEFSharp } from 'ffxiv-overlay-api';
isCEFSharp();
```

Then you can add bunch of different listeners.

```js
overlay.addListener('CombatData', (data) => {
  console.log('listener of `CombatData`', data);
});
overlay.addListener('ChangeZone', (data) => {
  console.log('listener of `ChangeZone`', data);
});
```

Call this function once you’re done adding all of your listeners:

```js
overlay.startEvent();
```

Once this function has been called, OverlayPlugin will start sending events. Some events will be raised immediately with current state information like `ChangeZone` or `ChangePrimaryPlayer`.

After that, put the URL of your overlay into OverlayPlugin, or use the WebSocket URL when enabled. Checkout the [index.html](https://github.com/dsrkafuu/ffxiv-overlay-api/blob/master/test/index.html) for example usage, you can download this file and load it from the OverlayPlugin. Enable WebSocked in your plugin and add `?OVERLAY_WS=ws://127.0.0.1:[port]/ws` or `?HOST_PORT=ws://127.0.0.1:[port]` after you overlay URL to access the WebSocket server.

Checkout [Development](#development) section for more details and my new overlay [Skyline Overlay](https://github.com/dsrkafuu/skyline-overlay) for example.

## API

You can find all events available in <https://ngld.github.io/OverlayPlugin/devs/event_types>.

### `addListener`

`addListener(event: EventType, cb: EventCallback): void;`

add an event listener

### `removeListener`

`removeListener(event: EventType, cb: EventCallback): void;`

remove a listener

### `removeAllListener`

`removeAllListener(event: EventType): void;`

remove all listener of one event type

### `getAllListener`

`getAllListener(event: EventType): EventCallback[];`

get all listeners of a event

### `startEvent`

`startEvent(): void;`

start listening event

### `endEncounter`

`endEncounter(): Promise<void>;`

ends current encounter and save it, not working in websocket mode

### `callHandler`

`callHandler(msg: any): Promise<any>;`

This function allows you to call an overlay handler, these handlers are declared by Event Sources, either built into OverlayPlugin or loaded through addons like Cactbot.

### `simulateData`

`simulateData(data: EventData): void;`

simulate triggering event once

### `OverlayAPI.mergeCombatant`

`mergeCombatant(...args: CombatantData[]): CombatantData | null;`

static function for merging combatant like pets into first player arg

### `OverlayAPI.isCEFSharp`

`isCEFSharp(): boolean;`

check if in overlay plugin emblemed cef

## Development

Clone this repo, then:

```bash
npm install
npm start
```

You can access the test overlay at `http://localhost:5000/test/`, `http://localhost:5000/test/?OVERLAY_WS=ws://127.0.0.1:[port]/ws` or `http://localhost:5000/test/?HOST_PORT=ws://127.0.0.1:[port]`.

Remember to run `npm run build` before release commit.

## Contributon

Please use the `.prettierrc` at the root of the project along with [Prettier default settings](https://prettier.io/docs/en/options.html) to format your code.

## Annotations

- [ngld/OverlayPlugin](https://github.com/ngld/OverlayPlugin) - MIT License
- [hibiyasleep/OverlayPlugin](https://github.com/hibiyasleep/OverlayPlugin) - MIT License
- [RainbowMage/OverlayPlugin](https://github.com/RainbowMage/OverlayPlugin) - MIT License

> Copyright © 2020-present DSRKafuU (<https://dsrkafuu.net>)
