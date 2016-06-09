import url from 'url';
import React from 'react';
import Tab from '../component/Tab';
import DevToolsPanelCookieView from './DevToolsPanelCookieView';
import DevToolsPanelStorageView from './DevToolsPanelStorageView';
import DevToolsPanelRequestView from './DevToolsPanelRequestView';
import DevToolsPanelDebugView from './DevToolsPanelDebugView';
import { getCurrentTab, getCookieJwts, getStorageJwts, getRequestItems } from '../backgroundApi';
import '../../css/dev-tools-panel-view.less';

let matchDomain = (jwt, domain) => jwt.domainRegExp ? domain.match(jwt.domainRegExp) !== null : domain === jwt.domain;

export default class DevToolsPanelView extends React.Component {
  state = {
    jwtCookieCount: 0,
    jwtStorageCount: 0,
    jwtRequestCount: 0,
    mostRecentTabId: null,
    currentTabUrl: null,
    selectedTabId: 'debug'
  };

  constructor(...args) {
    super(...args);
    this.messageBus = chrome.runtime.connect({name: "jwts"});
    this.onMessageListener = this.onMessage.bind(this);
  }

  onMessage(message) {
    switch (message.action) {
      case 'page.activated':
        getCurrentTab().then((tab) => {
          this.setState({
            currentTabUrl: tab.url,
            mostRecentTabId: tab.id
          });

          if (tab && tab.url) {
            this.setState({
              currentTabUrl: tab.url,
              mostRecentTabId: tab.id
            });

            let parsedUrl = url.parse(tab.url);

            getCookieJwts().then((jwts) => {
              this.setState({
                jwtCookieCount: jwts.filter(x => matchDomain(x, parsedUrl.hostname)).length
              });
            });

            getStorageJwts().then((jwts) => {
              this.setState({
                jwtStorageCount: jwts.filter(x => matchDomain(x, parsedUrl.hostname) && x.port === parsedUrl.port).length
              });
            });

            getRequestItems().then((items) => {
              this.setState({
                jwtRequestCount: items.filter(x => x.tabId === tab.id).length
              });
            });
          }
        });
        break;

      case 'cookies.changed':
        getCookieJwts().then((jwts) => {
          let count = 0;

          if (this.state.currentTabUrl) {
            let parsedUrl = url.parse(this.state.currentTabUrl);
            count = jwts.filter(x => matchDomain(x, parsedUrl.hostname)).length;
          }

          this.setState({
            jwtCookieCount: count
          });
        });
        break;

      case 'storage.changed':
        getStorageJwts().then((jwts) => {
          let count = 0;

          if (this.state.currentTabUrl) {
            let parsedUrl = url.parse(this.state.currentTabUrl);
            count = jwts.filter(x => matchDomain(x, parsedUrl.hostname) && x.port === parsedUrl.port).length;
          }

          this.setState({
            jwtStorageCount: count
          });
        });
        break;

      case 'requests.changed':
        getRequestItems().then((items) => {
          let count = 0;

          if (this.state.mostRecentTabId) {
            count = items.filter(x => x.tabId === this.state.mostRecentTabId).length;
          }

          this.setState({
            jwtRequestCount: count
          });
        });
        break;
    }
  }

  componentWillMount() {
    this.messageBus.onMessage.addListener(this.onMessageListener);

    getCurrentTab().then((tab) => {
      if (tab && tab.url) {
        this.setState({
          currentTabUrl: tab.url,
          mostRecentTabId: tab.id
        });

        let parsedUrl = url.parse(tab.url);

        getCookieJwts().then((jwts) => {
          this.setState({
            jwtCookieCount: jwts.filter(x => matchDomain(x, parsedUrl.hostname)).length
          });
        });

        getStorageJwts().then((jwts) => {
          this.setState({
            jwtStorageCount: jwts.filter(x => matchDomain(x, parsedUrl.hostname) && x.port === parsedUrl.port).length
          });
        });

        getRequestItems().then((items) => {
          this.setState({
            jwtRequestCount: items.filter(x => x.tabId === tab.id).length
          });
        });
      }
    });
  }

  componentWillUnmount() {
    this.messageBus.onMessage.removeListener(this.onMessageListener);
  }

  isTabSelected(id) {
    return this.state.selectedTabId === id;
  }

  onTabClicked(id) {
    this.setState({
      selectedTabId: id
    });
  }

  render() {
    let content = [];

    switch (this.state.selectedTabId) {
      case 'debug':
        content.push(<DevToolsPanelDebugView />);
        break;

      case 'cookie':
        content.push(<DevToolsPanelCookieView />);
        break;

      case 'storage':
        content.push(<DevToolsPanelStorageView />);
        break;

      case 'request':
        content.push(<DevToolsPanelRequestView />);
        break;
    }

    let createTab = (id, title, icon, badgeCount) => {
      let badge = null;
      let disabled = false;

      if (badgeCount !== undefined) {
        if (badgeCount === 0) {
          disabled = true;
        }
        badge = <span className="badge">{badgeCount}</span>;
      }

      return (
        <Tab id={id} onClick={this.onTabClicked.bind(this, id)} selected={this.isTabSelected(id)} disabled={disabled}>
          <i className={"fa fa-" + icon + " icon"} aria-hidden="true"></i>{title}{badge}
        </Tab>
      );
    };

    return (
      <div id="dev-tools-panel-view">
        <div id="debug"><img src="./../../assets/images/debug.jpg" /></div>
        <div className="menu">
          {createTab("debug", "Debug", "bug")}
          {createTab("cookie", "Cookies", "circle", this.state.jwtCookieCount > 0 ? this.state.jwtCookieCount : undefined)}
          {createTab("storage", "Storage", "archive", this.state.jwtStorageCount > 0 ? this.state.jwtStorageCount : undefined)}
          {createTab("request", "Requests", "paper-plane", this.state.jwtRequestCount > 0 ? this.state.jwtRequestCount : undefined)}
        </div>
        {content}
      </div>
    );
  }
}
