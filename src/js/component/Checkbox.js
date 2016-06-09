import React from 'react';

export default class Checkbox extends React.Component {
  state = {
    checked: false
  };

  componentWillMount() {
    if ('checked' in this.props) {
      this.setState({
        checked: Boolean(this.props.checked)
      })
    }
  }

  onClick(...args) {
    this.setState({
      checked: !this.state.checked
    });

    if ('onClick' in this.props) {
      this.props.onClick(...args);
    }
  }

  render() {
    let iconClassName = this.state.checked ?
      'fa-check-square' : 'fa-square';

    let style = {
      cursor: 'pointer'
    };

    let checkbox = (
      <i className={"fa " + iconClassName} aria-hidden="true" onClick={this.onClick.bind(this)} style={style}></i>
    );

    if ('label' in this.props) {
      checkbox = (
        <label onClick={this.onClick.bind(this)} style={style}>{checkbox} {this.props.label}</label>
      );
    }

    return checkbox;
  }
}
