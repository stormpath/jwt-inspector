import url from 'url';
import React from 'react';
import Tab from '../component/Tab';
import PopupOverviewView from './PopupOverviewView';
import PopupDebugView from './PopupDebugView';
import { getCurrentTabJwts } from '../backgroundApi';
import '../../css/popup-view.less';

export default class PopupView extends React.Component {
  state = {
    selectedTabId: 'overview',
    jwtCount: 0
  };

  isTabSelected(id) {
    return this.state.selectedTabId === id;
  }

  onTabClicked(id) {
    this.setState({
      selectedTabId: id
    });
  }

  componentWillMount() {
    // Determine whether or not there are JWTs for this tab. If not, then default to debug.
    getCurrentTabJwts().then((jwts) => {
      let jwtCount = jwts.cookies.length + jwts.requests.length + jwts.storage.length;
      this.setState({
        jwtCount: jwtCount,
        selectedTabId: jwtCount == 0 ? 'debug' : 'overview'
      });
    });
  }

  render() {
    let content = [];

    switch (this.state.selectedTabId) {
      case 'overview':
        content.push(<PopupOverviewView />);
        break;

      case 'debug':
        content.push(<PopupDebugView />);
        break;
    }

    let createTab = (id, title, icon, badgeCount) => {
      let disabled = false;

      if (badgeCount !== undefined) {
        if (badgeCount === 0) {
          disabled = true;
        }
        title += ` (${badgeCount})`;
      }

      return (
        <Tab id={id} onClick={this.onTabClicked.bind(this, id)} selected={this.isTabSelected(id)} disabled={disabled}>
          <i className={"fa fa-" + icon + " icon"} aria-hidden="true"></i>{title}
        </Tab>
      );
    };

    return (
      <div id="popup-view">
        <div className="menu">
          {createTab("overview", "Overview", "bars", this.state.jwtCount)}
          {createTab("debug", "Debug", "bug")}
        </div>
        {content}
      </div>
    );
  }
}
