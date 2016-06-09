import React from 'react';
import ReactDOM from 'react-dom';
import ContentEditable from './ContentEditable';
import { parseJwt, tokenizeJwt } from '../utils';
import Textarea from 'react-textarea-autosize';

let htmlRegex = /(<([^>]+)>)/ig;

function trimHtml(value) {
  return value.replace(htmlRegex, "");
}

function jwtToHtml(value) {
  let html = '';
  let tokens = tokenizeJwt(value);

  tokens.forEach((token) => {
    html += '<span class=\'' + token.type + '\'>' + token.value +  '</span>';
  });

  return html;
}

export default class JwtTextArea extends React.Component {
  state = {
    rawValue: '',
    formattedValue: ''
  };

  constructor(...args) {
    super(...args);
  }

  componentWillMount() {
    let jwtValue = this.props.jwt || '';
    let trimmedValue = trimHtml(jwtValue.trim());

    this.setState({
      rawValue: trimmedValue,
      formattedValue: jwtToHtml(trimmedValue)
    });
  }

  handleChange(event) {
    let eventValue = event.target.value;
    let trimmedValue = trimHtml(eventValue);

    this.setState({
      rawValue: trimmedValue,
      formattedValue: jwtToHtml(trimmedValue)
    });

    if ('onChange' in this.props) {
      this.props.onChange({
        value: trimmedValue
      });
    }
  }

  render() {
    let className = 'jwt-editor';
    let jwtValue = this.state.rawValue || this.props.jwt;

    if (jwtValue !== '') {
      let parsedJwt = parseJwt(jwtValue);
      className += ' ' + (parsedJwt ? 'parse-success' : 'parse-error');
    }

    if (this.props.colorize) {
      return (
        <ContentEditable
          {...this.props}
          className={className}
          html={this.state.formattedValue}
          onChange={this.handleChange.bind(this)}
        />
      );
    }

    if (this.props.autosize) {
      return (
        <Textarea
          {...this.props}
          className={className}
          value={jwtValue}
          onChange={this.handleChange.bind(this)} />
      );
    }

    return (
      <textarea
        {...this.props}
        className={className}
        value={jwtValue}
        onChange={this.handleChange.bind(this)} />
    );
  }
}
