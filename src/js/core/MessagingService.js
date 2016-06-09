export default class MessagingService {
  constructor() {
    this.listener = null;
  }

  _onMessageReceived(request, sender, sendResponse) {
      var targetMethod = request.method;

      // Don't handle if we don't have a method to respond to.
      if (!targetMethod) {
        return true;
      }

      var targetLocalMethodName = '_' + targetMethod;

      if (!(targetLocalMethodName in this)) {
        return sendResponse({
          error: `Method '${targetMethod}' not supported.`
        });
      }

      this[targetLocalMethodName].apply(this, [...request.args, request, sender])
        .then((result) => {
          sendResponse({
            result: result
          });
        }).catch((err) => {
          sendResponse({
            error: err.message
          });
        });

      // We must return true here to indicate that this is an async call. I.e:
      // "This function becomes invalid when the event listener returns, unless you return true from the
      // event listener to indicate you wish to send a response asynchronously (this will keep the message
      // channel open to the other end until sendResponse is called)."
      // https://developer.chrome.com/extensions/runtime#method-sendMessage
      return true;
    }

  start() {
    if (this.listener !== null) {
      return false;
    }

    this.listener = this._onMessageReceived.bind(this);
    chrome.runtime.onMessage.addListener(this.listener);

    return true;
  }

  stop() {
    if (this.listener === null) {
      return false;
    }

    chrome.runtime.onMessage.removeListener(this.listener);
    this.listener = null;

    return true;
  }
}
