import url from 'url';
import { isJwt, getTabStorage } from '../utils';

export default class StorageJwtDiscoverer {
  constructor(app, store) {
    this.app = app;
    this.store = store;
  }

  _captureStorageKeysWithJwt() {
    setTimeout(() => {
      this.app._getCurrentTab().then((tab) => {
        var parsedUrl = url.parse(tab.url);
        getTabStorage(tab).then((storage) => {
          // Cleanup all storage items in the
          // jwt store for the current domain.
          this.store.remove(x =>
            x.domain === parsedUrl.hostname &&
            x.port === parsedUrl.port
          );

          for (let name in storage.local) {
            let value = storage.local[name];

            if (isJwt(value)) {
              this.store.set({
                type: 'local',
                domain: parsedUrl.hostname,
                port: parsedUrl.port,
                name: name,
                value: value
              });
            }
          }

          for (let name in storage.session) {
            let value = storage.session[name];
            if (isJwt(value)) {
              this.store.set({
                type: 'session',
                domain: parsedUrl.hostname,
                port: parsedUrl.port,
                name: name,
                value: value
              });
            }
          }
        });
      });
    }, 0);
  }

  start() {
    // When a tab is selected, refresh the badge count and flag it as selected.
    chrome.tabs.onActivated.addListener(() => {
      this._captureStorageKeysWithJwt();
    });

    // When the a tab is updated, refresh the keys in local storage and the JWT count badge.
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.status === 'loading') {
        this._captureStorageKeysWithJwt();
      }
    });

    this._captureStorageKeysWithJwt();
  }

  stop() {
  }
}
