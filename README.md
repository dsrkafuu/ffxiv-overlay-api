# ffxiv-overlay-api

[![BADGE](https://img.shields.io/npm/v/ffxiv-overlay-api?style=flat-square)](https://www.npmjs.com/package/ffxiv-overlay-api) [![BADGE](https://img.shields.io/npm/dm/ffxiv-overlay-api?style=flat-square)](https://www.npmjs.com/package/ffxiv-overlay-api) [![BADGE](https://img.shields.io/bundlephobia/min/ffxiv-overlay-api?style=flat-square)](https://www.npmjs.com/package/ffxiv-overlay-api) [![BADGE](https://img.shields.io/npm/l/ffxiv-overlay-api?style=flat-square)](https://github.com/amzrk2/ffxiv-overlay-api/blob/master/LICENSE)

Build your own modern FFXIV overlay with npm.

This library needs to be used along with [ngld/OverlayPlugin](https://github.com/ngld/OverlayPlugin).

## Installation

You can install it from [npm registry](https://www.npmjs.com/package/ffxiv-overlay-api):

```bash
npm install ffxiv-overlay-api --save
```

Or import the library from jsDelivr CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/ffxiv-overlay-api@1.1/lib/overlay.min.js"></script>
```

## Usage

After installation, you can import the library:

```js
import OverlayAPI from 'ffxiv-overlay-api';
const overlay = new OverlayAPI();
```

Note that this library only works in browser.

You can also pass options to constructor:

```js
const overlay = new OverlayAPI({
  liteMode: true,
  simulateData: false,
});
```

Then you can add listeners. Different from origin library, you can add or remove listeners whenever you want without calling `startOverlayEvents()`.

```js
const overlay = new OverlayAPI();
overlay.addListener('CombatData', (data) => {
  console.log('Listener of CombatData', data);
});
overlay.addListener('ChangeZone', (data) => {
  console.log('Listener of ChangeZone', data);
});
```

Then put the URL of your overlay into OverlayPlugin, or use the WebSocket URL when enabled. Checkout the [index.html](https://github.com/amzrk2/ffxiv-overlay-api/blob/master/test/index.html) for example usage, you can download this file and load it from the OverlayPlugin. Enable WebSocked in your plugin and add `?OVERLAY_WS=ws://127.0.0.1:[port]/ws` after you overlay URL to access the WebSocket server.

Checkout [Development](#development) section for more details.

## API

You can find all events available in <https://ngld.github.io/OverlayPlugin/devs/event_types>.

### `OverlayAPI.addListener(event, cb)`

Add an event listener.

- `@param {String} event` Event to listen
- `@param {Function} cb` Callback function

### `OverlayAPI.listListener(event)`

List all listeners of an event.

- `@param {String} event` Event to list listeners

### `OverlayAPI.removeListener(event, cb)`

Remove a listener.

- `@param {String} event` Event type which listener belongs to
- `@param {Function} cb` Function of which listener to remove

### `OverlayAPI.removeAllListener(event)`

Remove all listener of one event type.

- `@param {String} event` Event type which listener belongs to

### `OverlayAPI.endEncounter()`

Switch data simulation.

- `@param {Boolean} status` Simulate status

### `OverlayAPI.simulateData(status)`

Ends current encounter and save it. Returns a Promise.

### `OverlayAPI.call(msg)`

This function allows you to call an overlay handler. These handlers are declared by Event Sources (either built into OverlayPlugin or loaded through addons like Cactbot). Returns a Promise.

- `@param {Object} msg` Message send to OverlayPlugin

## Development

Clone this repo, then:

```bash
npm install
npm start
```

You can access the test overlay at `http://localhost:5000/test/` and `http://localhost:5000/test/?OVERLAY_WS=ws://127.0.0.1:[port]/ws`.

Remember to run `npm run build` before release commit.

## Contributon

Please use the `.prettierrc` at the root of the project along with [Prettier default settings](https://prettier.io/docs/en/options.html) to format your code.

## Annotations

- [ngld/OverlayPlugin](https://github.com/ngld/OverlayPlugin) - MIT License
- [hibiyasleep/OverlayPlugin](https://github.com/hibiyasleep/OverlayPlugin) - MIT License
- [RainbowMage/OverlayPlugin](https://github.com/RainbowMage/OverlayPlugin) - MIT License

> © 2020 DSRKafuU [Twitter @amzrk2](https://twitter.com/amzrk2)
