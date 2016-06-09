let jwtAnyExpression = /([a-zA-Z0-9+/\-_=]+\.[a-zA-Z0-9+/\-_=]+\.[a-zA-Z0-9+/\-_=]+)/;
let jwtExactExpression = /^[a-zA-Z0-9+/\-_=]+\.[a-zA-Z0-9+/\-_=]+\.[a-zA-Z0-9+/\-_=]+$/;

export function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

export function base64Decode(value) {
  return new Buffer(value, 'base64').toString('utf8');
}

export function makeAndFilter(oldFilter, newFilter) {
  return oldFilter ? (x => oldFilter(x) && newFilter(x)) : newFilter;
}

export function makeOrFilter(oldFilter, newFilter) {
  return oldFilter ? (x => oldFilter(x) || newFilter(x)) : newFilter;
}

export function prettyPrintJson(value) {
  let result = [];

  function pushPart(type, value) {
    result.push(<span className={'token ' + type}>{value}</span>);
  }

  function walk(item, level) {
    let itemType = typeof item;

    switch (itemType) {
      case 'object':
        if (item instanceof Array) {
          pushPart('array_open', '[');

          for (let i = 0; i < item.length; i++) {
            let subItem = item[i];

            if (i > 0) {
              pushPart('array_delim', ',', level);
            }

            pushPart('whitespace', <br />);
            pushPart('whitespace', " ".repeat(2 * (level + 1)));

            walk(subItem, level + 1);
          }

          pushPart('whitespace', <br />);
          pushPart('whitespace', " ".repeat(2 * level));

          pushPart('array_close', ']');
        } else if (item === null) {
          pushPart('null', 'null');
        } else {
          let hasMoreKeys = false;

          pushPart('object_open', '{');
          pushPart('whitespace', <br />);

          for (let key in item) {
            if (hasMoreKeys) {
              pushPart('object_delim', ',');
              pushPart('whitespace', <br />);
            }

            let value = item[key];
            pushPart('whitespace', " ".repeat(2 * (level + 1)));
            pushPart('object_key', key);
            pushPart('object_key_delim', ':');
            pushPart('whitespace', ' ');
            walk(value, level + 1);

            hasMoreKeys = true;
          }

          pushPart('whitespace', <br />);
          pushPart('whitespace', " ".repeat(2 * level));
          pushPart('object_close', '}');
        }
        break;

      case 'string':
        pushPart('string_open', '"');
        pushPart('string', item.replace(/"/g, '\\\"'));
        pushPart('string_close', '"');
        break;

      case 'boolean':
      case 'number':
      case 'undefined':
        pushPart(itemType, String(item));
        break;
    }
  }

  walk(value, 0);

  return result;
}

export function tokenizeJwt(value) {
  if (!value) {
    return [];
  }

  let tokens = [];
  let buffer = '';
  let jwtPartIndex = 0;
  let jwtParts = ['header', 'payload', 'signature'];

  function pushTokenInBuffer() {
    if (buffer !== '') {
      tokens.push({
        type: jwtParts[jwtPartIndex] || 'unknown',
        value: buffer
      });
      buffer = '';
      jwtPartIndex++;
    }
  }

  for (let index = 0; index < value.length; index++) {
    let chr = value[index];

    if (chr === '.' && jwtPartIndex < jwtParts.length) {
      pushTokenInBuffer();
      tokens.push({
        type: 'separator',
        value: '.'
      });
    } else {
      buffer += chr;
    }
  }

  pushTokenInBuffer();

  return tokens;
}

export function getAllJwtCookies() {
  return new Promise((accept, reject) => {
    chrome.cookies.getAll({}, (cookies) => {
      let jwtCookies = cookies.filter((cookie) => isJwt(cookie.value));

      let resultCookies = jwtCookies.map(cookie => {
        return {
          domain: cookie.domain,
          path: cookie.path,
          secure: cookie.secure,
          name: cookie.name,
          value: cookie.value
        }
      });

      accept(resultCookies);
    });
  });
}

export function parseJwt(value, skipValidate) {
  if (!value) {
    return false;
  }

  value = value.trim();

  if (value.match(jwtExactExpression) === null) {
    return false;
  }

  let [header, body, signature] = value.split('.');

  try {
    return {
      header: JSON.parse(base64Decode(header)),
      body: JSON.parse(base64Decode(body)),
      signature: signature,
      raw: value
    };
  } catch (err) {
    return false;
  }
}

export function isJwt(value) {
  return parseJwt(value) !== false;
}

export function getCurrentTab(mostRecentTabId) {
  return new Promise((accept, reject) => {
    chrome.tabs.query({ lastFocusedWindow: true, active: true }, (tabs) => {
      var tab = tabs[0];

      if (tab) {
        return accept(tab);
      }

      if (!mostRecentTabId) {
        return reject(new Error('No active tab identified.'));
      }

      chrome.tabs.get(mostRecentTabId, (tab) => {
        if (!tab) {
          return reject(new Error('No active tab identified.'));
        }

        accept(tab);
      });
    });
  });
}

export function getTabStorage(tab) {
  return new Promise((accept, reject) => {
    if (tab.url.indexOf('chrome') === 0) {
      return reject(new Error('Unable to retrieve local storage for chrome page.'));
    }

    chrome.tabs.executeScript(tab.id, {
      code: `
        var result = {local: {}, session: {}};

        for (var key in window.localStorage) {
          result.local[key] = window.localStorage[key];
        }

        for (var key in window.sessionStorage) {
          result.session[key] = window.sessionStorage[key];
        }

        // For some reason we cannot do "return" here.
        result;
      `,
      runAt: "document_start"
    }, (result) => {
      if (!result) {
        return reject(new Error('Unknown error executing script in tab.'));
      }

      accept(result[0]);
    });
  });
}

// Originally from: https://gist.github.com/joeperrin-gists/8814825
export function setClipboardText(text) {
  const input = document.createElement('input');
  input.style.position = 'fixed';
  input.style.opacity = 0;
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
}

// Slightly modified, but originally from: http://stackoverflow.com/a/28618811
export function getClipboardText() {
  let container = document.createElement("div");

  container.style.position = "absolute";
  container.style.left = "-10000px";
  container.style.top = "-10000px";
  container.contentEditable = true;

  let insertionElement = document.activeElement;
  let nodeName = insertionElement.nodeName.toLowerCase();
  let tagsToIgnore = ['body', 'div', 'li', 'th', 'td'];

  while (tagsToIgnore.indexOf(nodeName) === -1) {
    insertionElement = insertionElement.parentNode;
    nodeName = insertionElement.nodeName.toLowerCase();
  }

  insertionElement.appendChild(container);

  container.focus();
  document.execCommand('paste');

  let clipboardText = container.innerText;
  insertionElement.removeChild(container);

  return clipboardText;
}
