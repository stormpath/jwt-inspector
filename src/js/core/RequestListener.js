import { EventEmitter } from 'events';

export default class RequestListener extends EventEmitter {
  constructor() {
    super();
    this.buffer = {};
    this.onBeforeRequestListener = this.onBeforeRequest.bind(this);
    this.onBeforeSendHeadersListener = this.onBeforeSendHeaders.bind(this);
    this.onBeforeRedirectListener = this.onCompleted.bind(this); // Currently we'll just handle redirects as completed requests.
    this.onCompletedListener = this.onCompleted.bind(this);
    this.onErrorOccurredListener = this.onErrorOccurred.bind(this);
  }

  onBeforeRequest(request) {
    let url = request.url;

    // Skip any chrome requests... I.e. chrome:// or chrome-extension://...
    if (url.indexOf('chrome') === 0) {
      return;
    }

    this.buffer[request.requestId] = {
      method: request.method,
      url: url,
      requestId: parseInt(request.requestId),
      tabId: request.tabId,
      request: {
        body: request.requestBody,
        createdAt: request.timeStamp
      }
    };
  }

  onBeforeSendHeaders(request) {
    let requestItem = this.buffer[request.requestId];

    if (!requestItem) {
      return;
    }

    requestItem.request.headers = request.requestHeaders;
  }

  onCompleted(request) {
    let requestItem = this.buffer[request.requestId];

    if (!requestItem) {
      return;
    }

    requestItem.response = {
      statusCode: request.statusCode,
      headers: request.responseHeaders,
      createdAt: request.timeStamp
    };

    this.emit('request', requestItem);

    delete this.buffer[request.requestId];
  }

  onErrorOccurred(request) {
    let requestItem = this.buffer[request.requestId];

    if (!requestItem) {
      return;
    }

    this.emit('error', requestItem);

    delete this.buffer[request.requestId];
  }

  start() {
    let allUrls = {
      urls: ['<all_urls>']
    };

    chrome.webRequest.onBeforeRequest.addListener(this.onBeforeRequestListener, allUrls, ['requestBody']);
    chrome.webRequest.onBeforeSendHeaders.addListener(this.onBeforeSendHeadersListener, allUrls, ['requestHeaders']);
    chrome.webRequest.onBeforeRedirect.addListener(this.onBeforeRedirectListener, allUrls, ['responseHeaders']);
    chrome.webRequest.onCompleted.addListener(this.onCompletedListener, allUrls, ['responseHeaders']);
    chrome.webRequest.onErrorOccurred.addListener(this.onErrorOccurredListener, { urls: ['<all_urls>'] });
  }

  stop() {
    chrome.webRequest.onBeforeRequest.removeListener(this.onBeforeRequestListener);
    chrome.webRequest.onBeforeSendHeaders.removeListener(this.onBeforeSendHeadersListener);
    chrome.webRequest.onBeforeRedirect.removeListener(this.onBeforeRedirectListener);
    chrome.webRequest.onCompleted.removeListener(this.onCompletedListener);
    chrome.webRequest.onErrorOccurred.removeListener(this.onErrorOccurredListener);
  }
}
