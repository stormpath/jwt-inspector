'use strict';

// Used to extend console with a console.jwt() function.

(function () {
  var jwtExpression = /^[a-zA-Z0-9+/\-_=]+\.[a-zA-Z0-9+/\-_=]+\.[a-zA-Z0-9+/\-_=]+$/;

  function JWT(header, body, signature) {
    this.header = header;
    this.body = body;
    this.signature = signature;
  }

  function parseJwt(value, skipValidate) {
    if (!value || value.match(jwtExpression) === null) {
      return false;
    }

    var tokens = value.split('.');
    var header = tokens[0];
    var body = tokens[1];
    var signature = tokens[2];

    try {
      return new JWT(
        JSON.parse(atob(header)),
        JSON.parse(atob(body)),
        signature
      );
    } catch (err) {
      return false;
    }
  }

  if (!window.console.jwt) {
    window.console.jwt = function consoleJwt() {
      var args = [].slice.call(arguments);
      var value = args.pop();
      var parsedJwt = parseJwt(value);

      if (!parsedJwt) {
        return console.error('console.jwt: ' + value + ' is not a valid JWT.');
      }

      args.push(parsedJwt);

      console.log.apply(this, args);
    };
  }
})();
