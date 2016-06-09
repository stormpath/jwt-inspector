import React from 'react';
import Table from '../component/Table';
import SplitPane from '../component/SplitPane';
import Checkbox from '../component/Checkbox';
import DevToolsJwtDetailPanel from './DevToolsJwtDetailPanel';
import { makeAndFilter, makeOrFilter } from '../utils';
import { getCookieJwts, getCurrentTab } from '../backgroundApi';
import url from 'url';

export default class DevToolsPanelCookieView extends React.Component {
  state = {
    jwts: [],
    showNameOnly: false,
    selectedItem: null,
    selectedRowIndex: null,
    rightPanel: null,
    currentTabUrl: null,
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
        getCurrentTab().then((tab) => {
          this.setState({
            currentTabUrl: tab.url
          });
        });
        break;

      case 'cookies.changed':
        getCookieJwts().then((jwts) => {
          this.setState({
            jwts: jwts
          });
        });
        break;
    }
  }

  componentWillMount() {
    this.messageBus.onMessage.addListener(this.onMessageListener);

    getCurrentTab().then((tab) => {
      this.setState({
        currentTabUrl: tab.url
      });
    });

    getCookieJwts().then((jwts) => {
      this.setState({
        jwts: jwts
      });
    });
  }

  componentWillUnmount() {
    this.messageBus.onMessage.removeListener(this.onMessageListener);
  }

  getJwtFilter() {
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
      if (this.state.currentTabUrl) {
        let parsedUrl = url.parse(this.state.currentTabUrl);
        filter = makeAndFilter(filter, x => parsedUrl.hostname.match(x.domainRegExp) !== null && (x.path === '/' || x.path === parsedUrl.path));
      } else {
        filter = makeAndFilter(filter, x => false);
      }
    }

    if (filters.query) {
      filter = makeAndFilter(filter, x => (contains(x.domain, filters.query) || contains(x.path || '', filters.query) || contains(x.name || '', filters.query)));
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
        showNameOnly: false,
        selectedRowIndex: null
      });
    };

    this.setState({
      rightPanel: <DevToolsJwtDetailPanel data={row.context} onClose={clearRightPanel} />,
      showNameOnly: true,
      selectedRowIndex: index
    });
  }

  render() {
    let top = [];
    let content = [];
    let query = this.state.query;
    let filters = this.state.filters;
    let jwts = this.state.jwts.filter(this.getJwtFilter());

    top.push(
      <div className="sub-menu">
        <div className="item">
          <Checkbox checked={filters.currentPage} onClick={this.onFilterClicked.bind(this, 'currentPage')} label="Current page" />
        </div>
        <div className="divider"></div>
        <div className="item query">
          <label><i className="fa fa-filter icon" aria-hidden="true"></i>Filter</label>
          <input type="text" placeholder="E.g. name of cookie" onChange={this.onQueryChanged.bind(this)} />
        </div>
      </div>
    );

    let columns = [{
      title: "Name"
    }, {
      title: "Domain"
    }, {
      title: "Path"
    }, {
      title: "Value"
    }, {
      title: "Secure"
    }, {
      title: "HTTP Only"
    }];

    let rows = jwts.map((jwt, index) => {
      return {
        context: jwt,
        data: [
          jwt.name,
          jwt.domain,
          jwt.path,
          jwt.value,
          jwt.secure ? 'Yes' : 'No',
          jwt.httpOnly ? 'Yes' : 'No'
        ]
      };
    });

    if (this.state.showNameOnly) {
      columns = [columns[0]];
      rows.forEach((row) => {
        row.data = [row.data[0]];
      });
    }

    let jwtTable = (
      <Table
        emptyMessage="No JWT cookies discovered."
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
            left={jwtTable}
            right={this.state.rightPanel}
            />
        </div>
      </div>
    );
  }
}
