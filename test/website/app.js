var express = require('express');

var mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0YWI1MmZhZi1iNGViLTRjOTYtYTcwZS1lNTg4ODVkNWU0YzEiLCJpc3MiOiJqd3QtaW5zcGVjdG9yIn0.qkuEbJJCMAfA91s688ebAZ_xyXMUDeXHd4Q6l4RdV8Y';

var app = express();

app.use('/js', express.static('js'));

app.get('/', function (req, res) {
  res.send(
    '<html>\n'
      +'<head>\n' +
        '<script src="/js/jquery-2.2.3.min.js"></script>\n' +
        '<script src="/js/main.js"></script>\n' +
      '</head>\n' +
      '<body>\n' +
      '</body>\n' +
    '</html>'
  );

  res.end();
});

app.get('/jwt/none', function (req, res) {
  res.send('No JWT headers sent.');
  res.end();
});

app.get('/jwt/response', function (req, res) {
  res.header('HEADER_RESPONSE_JWT', mockJwt);
  res.end();
});

app.use('/jwt/request', function (req, res) {
  res.end();
});

app.listen(5000, function () {
  console.log('Test site listening at http://localhost:5000/');
});
