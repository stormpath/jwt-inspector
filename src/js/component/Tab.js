import React from 'react';
import '../../css/tab.less';

export default class Tab extends React.Component {
  onClick() {
    this.props.onClick();
  }

  render() {
    return (
      <span className={'tab' + (this.props.selected ? ' selected' : '') + (this.props.disabled ? ' disabled' : '')} onClick={this.onClick.bind(this)}>
        {this.props.children}
      </span>
    );
  }
}
