import url from 'url';
import { isJwt, getAllJwtCookies } from '../utils';

export default class CookieJwtDiscoverer {
  constructor(store) {
    this.store = store;
  }

  start() {
    // Do an initial read of all cookies and find those with JWTs.
    setTimeout(() => {
      getAllJwtCookies().then((cookies) => {
        cookies.forEach((cookie) => {
          this.store.set({
            domain: cookie.domain,
            name: cookie.name,
            value: cookie.value,
            secure: cookie.secure,
            path: cookie.path,
            httpOnly: cookie.httpOnly === true
          });
        });
      })
    }, 0);

    // Capture cookie changes and reflect these in the JWT cookie store.
    chrome.cookies.onChanged.addListener((changeInfo) => {
      var cookie = changeInfo.cookie;

      if (changeInfo.removed) {
        this.store.remove(this.store.getIdPredicate(cookie));
      } else {
        if (isJwt(cookie.value)) {
          this.store.set({
            domain: cookie.domain,
            name: cookie.name,
            value: cookie.value,
            secure: cookie.secure,
            path: cookie.path,
            httpOnly: cookie.httpOnly === true
          });
        }
      }
    });
  }

  stop() {
  }
}
