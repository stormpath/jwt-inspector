export default class DevToolsApp {
  run() {
    chrome.devtools.panels.create(
      'JWT',
      'assets/images/default_icon.png',
      'build/html/DevToolsPanel.html',
      null
    );
  }
}
