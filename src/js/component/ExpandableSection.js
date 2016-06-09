import React from 'react';
import { setClipboardText, prettyPrintJson } from '../utils';

export default class ExpandableSection extends React.Component {
  state = {
    expanded: true
  };

  onHeaderClicked() {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  onCopyClicked(e) {
    e.preventDefault();
    e.stopPropagation();
    setClipboardText(this.props.value);
  }

  render() {
    let name = this.props.name;
    let value = this.props.value;
    let format = this.props.format || 'plain';
    let expanded = this.state.expanded;
    let copyable = this.props.copyable;

    if (format === "json") {
      value = prettyPrintJson(value);
    }

    let headerIcon = expanded ? "fa-caret-down" : "fa-caret-right";

    return (
      <div className="section">
        <div className="header" onClick={this.onHeaderClicked.bind(this)}>
          <i className={"fa " + headerIcon} aria-hidden="true"></i> {this.props.name}
          { expanded && copyable ? <span className="copy" onClick={this.onCopyClicked.bind(this)}><i className="fa fa-files-o" aria-hidden="true"></i></span> : null }
        </div>
        { expanded ?
          <div className={"body " + format}>{value}</div> :
          null }
      </div>
    );
  }
}
