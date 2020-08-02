# ffxiv-overlay-api

![BADGE](https://img.shields.io/npm/v/ffxiv-overlay-api?style=flat-square) ![BADGE](https://img.shields.io/npm/l/ffxiv-overlay-api?style=flat-square)

Build your own modern FFXIV overlay with npm.

This library needs to be used along with [ngld/OverlayPlugin](https://github.com/ngld/OverlayPlugin).

## Installation

You can install it from npm registry:

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

Then put the URL of your overlay into OverlayPlugin, or use the WebSocket. Checkout the [index.html](https://github.com/amzrk2/ffxiv-overlay-api/blob/master/index.html) for example usage, you can download this file and load it from the OverlayPlugin.

## API

### `OverlayAPI.add(event, cbs)`

Add an event listener.

- @param {String} event - Event to listen
- @param {Function|Array} cbs - Callback function(s)

### `OverlayAPI.list()`

List all event listeners.

### `OverlayAPI.remove(event, id)`

Remove a listener.

- @param {String} event - Event type which listener belongs to
- @param {Function|Number} id - Function or number which listener to remove

### `OverlayAPI.removeAll(event)`

Remove all listener of one event type.

- @param {String} event - Event type which listener belongs to

### `OverlayAPI.call(msg)`

This function allows you to call an overlay handler. These handlers are declared by Event Sources (either built into OverlayPlugin or loaded through addons like Cactbot). Returns a Promise.

- @param {Object} msg - Message send to OverlayPlugin

## Contributon

Please use the `prettier.config.js` at the root of the project along with [Prettier default settings](https://prettier.io/docs/en/options.html) to format your code.

## Annotations

- [ngld/OverlayPlugin](https://github.com/ngld/OverlayPlugin) - MIT License
- [hibiyasleep/OverlayPlugin](https://github.com/hibiyasleep/OverlayPlugin) - MIT License
- [RainbowMage/OverlayPlugin](https://github.com/RainbowMage/OverlayPlugin) - MIT License

> © 2020 DSRKafuU [Twitter @amzrk2](https://twitter.com/amzrk2) [GitHub @amzrk2](https://github.com/amzrk2)
