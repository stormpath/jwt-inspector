function makeApiCall(method, args) {
  return new Promise((accept, reject) => {
    var payload = {
      method: method,
      args: args || []
    };

    chrome.runtime.sendMessage(payload, function (response) {
      if (response.error) {
        reject(response.error);
      } else {
        accept(response.result);
      }
    });
  });
}

export function getCurrentTab() {
  return makeApiCall('getCurrentTab');
}

export function getCurrentTabJwts() {
  return makeApiCall('getCurrentTabJwts');
}

export function getCookieJwts() {
  return makeApiCall('getCookieJwts');
}

export function getClipboardJwt() {
  return makeApiCall('getClipboardJwt');
}

export function getStorageJwts() {
  return makeApiCall('getStorageJwts');
}

export function getRequestItems() {
  return makeApiCall('getRequestItems');
}

export function getPopupState() {
  return makeApiCall('getPopupState');
}

export function setPopupState(state) {
  return makeApiCall('setPopupState', [state]);
}

export function removeRequestItems(beforeRequestId, tabId) {
  return makeApiCall('removeRequestItems', [beforeRequestId, tabId]);
}

export function setPreserveLog(tabId, state) {
  return makeApiCall('setPreserveLog', [tabId, state]);
}
