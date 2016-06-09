'use strict';

// This content script is in an isolated scope.
// The code below allows us to inject a script into the document so that we gain access to the window.
// This script injected needs to be whitelisted in web_accessible_resources.

(function () {
  var scriptElement = document.createElement('script');

  scriptElement.src = chrome.extension.getURL('/assets/js/console-jwt.js');

  scriptElement.onload = function () {
    this.parentNode.removeChild(this);
  };

  (document.head || document.documentElement).appendChild(scriptElement);
})();
