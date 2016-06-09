JWT Inspector
=============

JWT Inspector is a Chrome extension that lets you inspect JSON Web Tokens in requests, cookies and local storage.
Also debug any JWT directly from the console or in the built-in UI.

## How to build

Run the command below, then upload the file `./build/jwt-inspector.zip` to the Chrome Web Store.

```term
$ npm run build
```

## How to load in Chrome

Open up Chrome and navigate to [the extensions page](chrome://extensions/).
Click the [Load unpacked extension...] button and navigate to your project directory, and click [open].

## How to develop

First load the extension into Chrome (step above) then run the command below to automatically
rebuild the extension on every change.

```term
$ npm run dev
```

## How to test

Currently testing is done manually by using a test page. Follow the instructions below to launch the test page.

```term
$ cd ./test/website/
$ npm install
$ open http://localhost:5000/ && node app.js
```

## Copyright

Copyright &copy; 2016 Stormpath, Inc. All rights reserved.
