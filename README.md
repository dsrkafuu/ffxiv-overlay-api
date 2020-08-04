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
<script src="https://cdn.jsdelivr.net/npm/ffxiv-overlay-api@1.0/lib/overlay.min.js"></script>
```

## Usage

After installation, you can import the library:

```js
import OverlayAPI from 'ffxiv-overlay-api';
const overlay = new OverlayAPI();
```

Note that this library only works in browser.

You can pass your event listeners to constructor, each event type can receive a function or an array:

```js
const overlay = new OverlayAPI({
  CombatData: [
    (data) => {
      console.log('Listener 1 of CombatData', data);
    },
    (data) => {
      console.log('Listener 2 of CombatData', data);
    },
  ],
  ChangeZone: (data) => {
    console.log('Listener of ChangeZone', data);
  },
});
```

You can also add them later. Different from origin library, you can add or remove listeners whenever you want without calling `startOverlayEvents()`.

```js
const overlay = new OverlayAPI();
overlay.add('CombatData', [
  (data) => {
    console.log('Listener 1 of CombatData', data);
  },
  (data) => {
    console.log('Listener 2 of CombatData', data);
  },
]);
overlay.add('ChangeZone', (data) => {
  console.log('Listener 1 of CombatData', data);
});
```

Then put the URL of your overlay into OverlayPlugin, or use the WebSocket URL when enabled. Checkout the [index.html](https://github.com/amzrk2/ffxiv-overlay-api/blob/master/test/index.html) for example usage, you can download this file and load it from the OverlayPlugin. Enable WebSocked in your plugin and add `?OVERLAY_WS=ws://127.0.0.1:[port]/ws` after you overlay URL to access the WebSocket server.

There is also an example Vue.js project in the `/test/vue` folder, you can clone this repo then run `npm run serve` to start Vue development server in `http://localhost:8080`.

Checkout [Development](#development) section for more details.

## API

You can find all events available in <https://ngld.github.io/OverlayPlugin/devs/event_types>.

### `OverlayAPI.add(event, cbs)`

Add an event listener.

- `@param {String} event` - Event to listen
- `@param {Function|Array} cbs` - Callback function(s)

### `OverlayAPI.list(event)`

List all listeners of an event.

- `@param {String} event` - Event to list listeners

### `OverlayAPI.remove(event, cb)`

Remove a listener.

- `@param {String} event` - Event type which listener belongs to
- `@param {Function|Number} cb` - Function or index number which listener to remove

### `OverlayAPI.removeAll(event)`

Remove all listener of one event type.

- `@param {String} event` - Event type which listener belongs to

### `OverlayAPI.call(msg)`

This function allows you to call an overlay handler. These handlers are declared by Event Sources (either built into OverlayPlugin or loaded through addons like Cactbot). Returns a Promise.

- `@param {Object} msg` - Message send to OverlayPlugin

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

> © 2020 DSRKafuU [Twitter @amzrk2](https://twitter.com/amzrk2) [GitHub @amzrk2](https://github.com/amzrk2)
