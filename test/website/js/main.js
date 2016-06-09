var mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0YWI1MmZhZi1iNGViLTRjOTYtYTcwZS1lNTg4ODVkNWU0YzEiLCJpc3MiOiJqd3QtaW5zcGVjdG9yIn0.qkuEbJJCMAfA91s688ebAZ_xyXMUDeXHd4Q6l4RdV8Y';

$(document).ready(function () {
  function setCookieButton() {
    var buttonElement = $('<button>Set Cookie</button>');

    buttonElement.click(function () {
      document.cookie = 'cookie_jwt=' + mockJwt;
      window.location.reload();
    });

    return buttonElement;
  }

  function clearCookieButton() {
    var buttonElement = $('<button>Clear Cookie</button>');

    buttonElement.click(function () {
      document.cookie = 'cookie_jwt=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.reload();
    });

    return buttonElement;
  }

  function makeLocalStorageButton() {
    var buttonElement = $('<button>Set Local Storage</button>');

    buttonElement.click(function () {
      window.localStorage.local_jwt = mockJwt;
      window.location.reload();
    });

    return buttonElement;
  }

  function makeSessionStorageButton() {
    var buttonElement = $('<button>Set Session Storage</button>');

    buttonElement.click(function () {
      window.sessionStorage.session_jwt = mockJwt;
      window.location.reload();
    });

    return buttonElement;
  }

  function clearStorageButton() {
    var buttonElement = $('<button>Clear Storage</button>');

    buttonElement.click(function () {
      delete window.localStorage['local_jwt'];
      delete window.sessionStorage['session_jwt'];
      window.location.reload();
    });

    return buttonElement;
  }

  function makeHttpRequestWithJwtQueryStringButton() {
    var buttonElement = $('<button>Make HTTP Request (with JWT in query string)</button>');

    buttonElement.click(function () {
      $.get('/jwt/request?jwt=' + encodeURIComponent(mockJwt));
    });

    return buttonElement;
  }

  function makeHttpRequestWithJwtResponseHeaderButton() {
    var buttonElement = $('<button>Make HTTP Request (with JWT in response header)</button>');

    buttonElement.click(function () {
      $.get('/jwt/response');
    });

    return buttonElement;
  }

  function makeHttpRequestWithJwtRequestHeaderButton() {
    var buttonElement = $('<button>Make HTTP Request (with JWT in request header)</button>');

    buttonElement.click(function () {
      $.ajax({
        method: 'GET',
        url: '/jwt/request',
        headers: {
          HEADER_REQUEST_JWT: mockJwt
        },
        dataType: 'json',
        data: {}
      });
    });

    return buttonElement;
  }

  function makeHttpRequestWithJwtRequestBodyButton() {
    var buttonElement = $('<button disabled=disabled>Make HTTP Request (with JWT in request body)</button>');

    buttonElement.click(function () {
      $.ajax({
        method: 'POST',
        url: '/jwt/request',
        dataType: 'json',
        data: {
          jwt: mockJwt
        }
      });
    });

    return buttonElement;
  }

  $('body')
    .append(setCookieButton())
    .append('<br />')
    .append(clearCookieButton())
    .append('<br /><br />')
    .append(makeLocalStorageButton())
    .append('<br />')
    .append(makeSessionStorageButton())
    .append('<br />')
    .append(clearStorageButton())
    .append('<br /><br />')
    .append(makeHttpRequestWithJwtQueryStringButton())
    .append('<br />')
    .append(makeHttpRequestWithJwtResponseHeaderButton())
    .append('<br />')
    .append(makeHttpRequestWithJwtRequestHeaderButton())
    .append('<br />')
    .append(makeHttpRequestWithJwtRequestBodyButton());
});
