import React from 'react';
import Table from '../component/Table';
import Checkbox from '../component/Checkbox';
import SplitPane from '../component/SplitPane';
import DevToolsRequestDetailPanel from './DevToolsRequestDetailPanel';
import { makeAndFilter, makeOrFilter } from '../utils';
import { getRequestItems, removeRequestItems, getCurrentTab, setPreserveLog } from '../backgroundApi';

export default class DevToolsPanelRequestView extends React.Component {
  state = {
    items: [],
    selectedItem: null,
    selectedRowIndex: null,
    rightPanel: null,
    currentTabId: null,
    preserveLog: false,
    filters: {
      currentPage: true,
      query: null
    }
  };

  constructor(...args) {
    super(...args);
    this.messageBus = chrome.runtime.connect({name: "jwts"});
    this.onMessageListener = this.onMessage.bind(this);
  }

  onMessage(message) {
    switch (message.action) {
      case 'page.activated':
        this.setState({
          currentTabId: message.tabId
        });
        break;

      case 'requests.changed':
        getRequestItems().then((items) => {
          this.setState({
            items: items
          });
        });
        break;
    }
  }

  componentWillMount() {
    this.messageBus.onMessage.addListener(this.onMessageListener);

    getCurrentTab().then((tab) => {
      setPreserveLog(tab.id, this.state.preserveLog);
      this.setState({
        currentTabId: tab.id
      });
    });

    getRequestItems().then((items) => {
      this.setState({
        items: items
      });
    });
  }

  componentWillUnmount() {
    this.messageBus.onMessage.removeListener(this.onMessageListener);
  }

  getFilter() {
    let filter = () => true;
    let filters = this.state.filters;

    let contains = (str, value) => {
      if (value === str) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      return str.toLowerCase().indexOf(value.toLowerCase()) !== -1;
    };

    if (filters.currentPage) {
      filter = makeAndFilter(filter, x => x.tabId === this.state.currentTabId);
    }

    if (filters.query) {
      filter = makeAndFilter(filter, x => contains(x.method, filters.query) || contains(x.url, filters.query));
    }

    return filter;
  }

  onFilterClicked(filterId) {
    let filters = this.state.filters;

    filters[filterId] = !filters[filterId];

    this.setState({
      filters: filters
    });
  }

  onPreserveLogClicked() {
    let preserveLog = this.state.preserveLog;
    let invertedState = !preserveLog;

    getCurrentTab().then((tab) => {
      setPreserveLog(tab.id, invertedState).then(() => {
        this.setState({
          preserveLog: invertedState
        });
      });
    });
  }

  onQueryChanged(e) {
    let filters = this.state.filters;

    filters.query = e.target.value;

    this.setState({
      filters: filters
    });
  }

  onColumnClick(column, index) {
  }

  onRowClicked(row, index) {
    let clearRightPanel = () => {
      this.setState({
        rightPanel: null,
        selectedRowIndex: null
      });
    };

    this.setState({
      rightPanel: <DevToolsRequestDetailPanel request={row.context} onClose={clearRightPanel} />,
      selectedRowIndex: index
    });
  }

  render() {
    let top = [];
    let content = [];
    let query = this.state.query;
    let filters = this.state.filters;
    let items = this.state.items.filter(this.getFilter());

    top.push(
      <div className="sub-menu">
        <div className="item">
          <Checkbox checked={filters.currentPage} onClick={this.onFilterClicked.bind(this, 'currentPage')} label="Current page" />
        </div>
        <div className="item">
          <Checkbox checked={this.state.preserveLog} onClick={this.onPreserveLogClicked.bind(this)} label="Preserve log" />
        </div>
        <div className="divider"></div>
        <div className="item query">
          <label><i className="fa fa-filter icon" aria-hidden="true"></i>Filter</label>
          <input type="text" placeholder="E.g. url of request" onChange={this.onQueryChanged.bind(this)} />
        </div>
      </div>
    );

    let columns = [{
      title: "Method"
    }, {
      title: "Url"
    }, {
      title: "Status"
    }];

    let rows = items.map((item, index) => {
      let hasJwt = item.jwts.length > 0;
      return {
        context: item,
        data: [
          item.method,
          item.url,
          item.response.statusCode
        ]
      };
    });

    let requestTable = (
      <Table
        emptyMessage="No JWT requests discovered."
        columns={columns}
        rows={rows}
        onColumnClick={this.onColumnClick.bind(this)}
        onRowClick={this.onRowClicked.bind(this)}
        selectedRowIndex={this.state.selectedRowIndex} />
    );

    return (
      <div>
        {top}
        <div className="content">
          {content}
          <SplitPane
            initialWidth="80%"
            left={requestTable}
            right={this.state.rightPanel}
            />
        </div>
      </div>
    );
  }
}
