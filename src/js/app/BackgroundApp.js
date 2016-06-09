import url from 'url';
import Store from '../core/Store';
import DomainStore from '../core/DomainStore';
import MessageBus from '../core/MessageBus';
import MessagingService from '../core/MessagingService';
import StorageJwtDiscoverer from '../core/StorageJwtDiscoverer';
import RequestJwtDiscoverer from '../core/RequestJwtDiscoverer';
import CookieJwtDiscoverer from '../core/CookieJwtDiscoverer';
import { isJwt, getAllJwtCookies, getCurrentTab, getTabStorage, endsWith, findJwtsInString, getClipboardText } from '../utils';

let matchDomain = (jwt, domain) => jwt.domainRegExp ? domain.match(jwt.domainRegExp) !== null : domain === jwt.domain;
let matchRequestPath = (jwt, path) => jwt.path === path;

export default class BackgroundApp extends MessagingService {
  constructor() {
    super();
    this.popupState = {};
    this.mostRecentTabId = null;
    this.mostRecentRequestId = 0;
    this.preserveLogsForTabs = {};
    this.messageBus = new MessageBus();
    this.jwtCookieStore = new DomainStore();
    this.jwtStorageStore = new DomainStore();
    this.requestItemStore = new Store();
    this.cookieJwtDiscoverer = new CookieJwtDiscoverer(this.jwtCookieStore);
    this.requestJwtDiscoverer = new RequestJwtDiscoverer(this.requestItemStore);
    this.storageJwtDiscoverer = new StorageJwtDiscoverer(this, this.jwtStorageStore);
  }

  _getCurrentTab() {
    return getCurrentTab(this.mostRecentTabId);
  }

  _getCurrentTabJwts() {
    return this._getCurrentTab().then((tab) => {
      let parsedUrl = url.parse(tab.url);

      let jwtPromises = [
        this._getCookieJwts().then((jwts) => {
          return jwts.filter(x => parsedUrl.hostname.match(x.domainRegExp) !== null && (x.path === '/' || x.path === parsedUrl.path));
        }),
        this._getStorageJwts().then((jwts) => {
          return jwts.filter(x => parsedUrl.hostname.match(x.domainRegExp) !== null && x.port === parsedUrl.port);
        }),
        this._getRequestItems().then((jwts) => {
          return jwts.filter(x => x.tabId === tab.id && parsedUrl.hostname.match(x.domainRegExp) !== null && parsedUrl.path === url.parse(x.url).path);
        })
      ];

      return Promise.all(jwtPromises).then((results) => {
        return {
          cookies: results[0],
          storage: results[1],
          requests: results[2]
        };
      });
    });
  }

  _getPopupState() {
    return new Promise((accept) => {
      accept(this.popupState);
    });
  }

  _setPopupState(state) {
    return new Promise((accept) => {
      for (let key in state) {
        this.popupState[key] = state[key];
      }
      accept();
    });
  }

  _getCookieJwts() {
    return new Promise((accept, reject) => {
      accept(this.jwtCookieStore.all());
    });
  }

  _getStorageJwts() {
    return new Promise((accept, reject) => {
      accept(this.jwtStorageStore.all());
    });
  }

  _getRequestItems() {
    return new Promise((accept, reject) => {
      accept(this.requestItemStore.all());
    });
  }

  _removeRequestItems(beforeRequestId, tabId) {
    return new Promise((accept, reject) => {
      accept(this.requestItemStore.remove(x => x.requestId < beforeRequestId && tabId === tabId));
    });
  }

  _setPreserveLog(tabId, state) {
    return new Promise((accept) => {
      this.preserveLogsForTabs[tabId] = state;
      accept();
    });
  }

  _getClipboardJwt() {
    return new Promise((accept) => {
      let clipboardText = getClipboardText();

      if (!clipboardText) {
        return reject(new Error('Nothing present in clipboard.'));
      }

      if (!isJwt(clipboardText)) {
        return reject(new Error('Text in clipboard is not a JWT.'));
      }

      accept(clipboardText);
    });
  }

  run() {
    let refreshJwtCountBadge = () => {
      this._getCurrentTab().then((tab) => {
        let parsedUrl = url.parse(tab.url);

        let jwtRequestItems = this.requestItemStore.find(x => x.tabId === this.mostRecentTabId && x.url === tab.url).slice(-1).pop();

        let jwtCookieCount = this.jwtCookieStore.count(x => matchDomain(x, parsedUrl.hostname));
        let jwtStorageCount = this.jwtStorageStore.count(x => matchDomain(x, parsedUrl.hostname) && x.port === parsedUrl.port);
        let totalJwtCount = jwtCookieCount + jwtStorageCount + (jwtRequestItems ? jwtRequestItems.jwts.length : 0);

        chrome.browserAction.setBadgeText({
          text: totalJwtCount > 0 ? totalJwtCount.toString() : ''
        });
      });
    };

    // When we add/remove JWTs in our store.
    // Refresh the badge and notify listeners that the JWTs have been changed.
    this.jwtCookieStore.on('changed', () => {
      refreshJwtCountBadge();
      this.messageBus.send('jwts', {
        action: 'cookies.changed'
      });
    });

    this.jwtStorageStore.on('changed', () => {
      refreshJwtCountBadge();
      this.messageBus.send('jwts', {
        action: 'storage.changed'
      });
    });

    this.requestItemStore.on('changed', () => {
      refreshJwtCountBadge();
      this.messageBus.send('jwts', {
        action: 'requests.changed'
      });
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
      this.requestItemStore.remove(request => request.tabId === tabId);
    });

    // When a tab is selected, refresh the badge count and flag it as selected.
    chrome.tabs.onActivated.addListener((activeInfo) => {
      // This is a hack that we need to do when the DevTools window is detached.
      // I.e. when we have detached DevTools from our window, we'll loose the active tab state from that window.
      // So because of that we use this in order to track which tab we most recently used.
      this.mostRecentTabId = activeInfo.tabId;

      this.messageBus.send('jwts', {
        action: 'page.activated',
        ...activeInfo
      });

      // Refresh the JWT badge count.
      refreshJwtCountBadge();
    });

    // When the a tab is updated, refresh the keys in local storage and the JWT count badge.
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.messageBus.send('jwts', {
        action: 'page.updated',
        tabId: tabId,
        ...changeInfo,
        ...tab
      });

      // Only do it once when the request is loading.
      if (changeInfo.status === 'loading') {
        // Don't clean if we should preserve the logs for the current tab.
        if (!(tabId in this.preserveLogsForTabs && this.preserveLogsForTabs[tabId] === true)) {
          // Cleanup old requests for the current tab.
          this.requestItemStore.remove(request =>
            // Remove all previous requests on the current tab.
            (request.tabId === tabId && request.id < this.mostRecentRequestId + 1) &&
            // But if the most recent request is the page we're on, then leave that intact.
            !(request.id === this.mostRecentRequestId && request.url === tab.url)
          );
        }

        // Refresh the JWT badge count.
        refreshJwtCountBadge();
      }
    });

    this.requestItemStore.on('set', (item) => {
      this.mostRecentRequestId = item.requestId;
    });

    this.cookieJwtDiscoverer.start();
    this.requestJwtDiscoverer.start();
    this.storageJwtDiscoverer.start();

    chrome.contextMenus.create({
      title: "View JWT",
      contexts: ["selection"],
      onclick: (e) => {
        chrome.tabs.create({
          url:"src/html/ViewJwt.html?jwt=" + encodeURIComponent(e.selectionText)
        });
      }
    });

    // Start our messaging service so that
    // we can start receiving API calls.
    this.messageBus.open();
    this.start();
  }
}
