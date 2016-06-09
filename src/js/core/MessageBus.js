export default class MessageBus {
  constructor() {
    this.listeners = {};
    this.listenerOffset = 0;
    this.connectListener = this._onConnect.bind(this);
  }

  _onConnect(port) {
    let name = port.name;
    let channelId = ++this.listenerOffset;

    let channelListeners = this.listeners[name];

    if (!channelListeners) {
      channelListeners = this.listeners[name] = {};
    }

    channelListeners[channelId] = port;

    port.onDisconnect.addListener(() => {
      delete channelListeners[channelId];
    });
  }

  send(name, message) {
    if (name in this.listeners) {
      for (let index in this.listeners[name]) {
        let channel = this.listeners[name][index];
        channel.postMessage(message);
      }
    }
  }

  open() {
    chrome.runtime.onConnect.addListener(this.connectListener);
  }

  close() {
    chrome.runtime.onConnect.removeListener(this.connectListener);
  }
}
