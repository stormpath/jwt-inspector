import url from 'url';
import React from 'react';
import Table from '../component/Table';
import PopupJwtDetailView from './PopupJwtDetailView';
import StormpathCredits from './StormpathCredits';
import { getCurrentTab, getCookieJwts, getStorageJwts, getRequestItems } from '../backgroundApi';
import '../../css/popup-overview-view.less';

export default class PopupOverviewView extends React.Component {
  state = {
    showCredits: true,
    overrideView: null,
    selectedItem: null,
    cookieJwts: [],
    storageJwts: [],
    requestWithJwts: null
  };

  constructor(...args) {
    super(...args);
    this.messageBus = chrome.runtime.connect({name: "jwts"});
    this.onMessageListener = this.onMessage.bind(this);
  }

  onMessage(message) {
    switch (message.action) {
      /*case 'storage.changed':
        getStorageJwts().then((jwts) => {
          this.setState({
            jwts: jwts
          });
        });
        break;*/
    }
  }

  componentWillMount() {
    this.messageBus.onMessage.addListener(this.onMessageListener);

    getCurrentTab().then((tab) => {
      let parsedUrl = url.parse(tab.url);

      getCookieJwts().then((jwts) => {
        this.setState({
          cookieJwts: jwts.filter(x => parsedUrl.hostname.match(x.domainRegExp) !== null && (x.path === '/' || x.path === parsedUrl.path))
        });
      });

      getStorageJwts().then((jwts) => {
        this.setState({
          storageJwts: jwts.filter(x => parsedUrl.hostname.match(x.domainRegExp) !== null && x.port === parsedUrl.port)
        });
      });

      getRequestItems().then((items) => {
        this.setState({
          requestWithJwts: items.filter(x => x.tabId === tab.id && x.url === tab.url).slice(-1).pop()
        });
      });
    });
  }

  componentWillUnmount() {
    this.messageBus.onMessage.removeListener(this.onMessageListener);
  }

  _isItemSelected = (item) => {
    var selectedItem = this.state.selectedItem;

    if (!selectedItem) {
      return false;
    }

    return item.source === selectedItem.source &&
      item.name === selectedItem.name;
  }

  onHeaderClicked(item) {
    this.setState({
      selectedItem: this._isItemSelected(item) ? null : item
    });
  }

  onColumnClick(column, index) {
  }

  onRowClicked(row, index) {
    let clearOverrideView = () => {
      this.setState({
        showCredits: true,
        overrideView: null
      });
    };

    this.setState({
      showCredits: false,
      overrideView: <PopupJwtDetailView data={row.context} onClose={clearOverrideView} />
    });
  }

  render() {
    let content = [];

    if (this.state.overrideView) {
      content.push(this.state.overrideView);
    } else {
      var items = [];

      let columns = [{
        title: 'Source'
      }, {
        title: 'Name'
      }];

      let rows = [];

      if (this.state.cookieJwts.length) {
        this.state.cookieJwts.forEach((jwt, index) => {
          rows.push({
            context: jwt,
            data: [
              'cookie',
              jwt.name
            ]
          });
        });
      }

      if (this.state.storageJwts.length) {
        this.state.storageJwts.forEach((jwt, index) => {
          rows.push({
            context: jwt,
            data: [
              jwt.type + ' storage',
              jwt.name
            ]
          });
        });
      }

      if (this.state.requestWithJwts) {
        let typeMap = {
          response_header: 'response header',
          request_header: 'request header'
        };

        this.state.requestWithJwts.jwts.forEach((item, index) => {
          rows.push({
            context: item,
            data: [
              typeMap[item.type] || 'request',
              item.name
            ]
          });
        });
      }

      content.push(
        <Table
          key="jwts"
          emptyMessage="No JWTs discovered."
          columns={columns}
          rows={rows}
          onColumnClick={this.onColumnClick.bind(this)}
          onRowClick={this.onRowClicked.bind(this)} />
      );
    }

    return (
      <div id="popup-overview-view">
        {content}
        { this.state.showCredits ?
          <StormpathCredits /> : null }
      </div>
    );
  }
}
