export default class OverlayAPI {
  // settings
  _options = {};
  // event subscribers
  // { event:string : cb:function[] }
  _subscribers = {};
  // plugin init status
  _status = false;
}
