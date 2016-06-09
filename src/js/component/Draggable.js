/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
import React from 'react';
import ReactDOM from 'react-dom';

let nopFn = () => {};

export default class Draggable extends React.Component {
  props = {
    onMove: nopFn,
    onStart: nopFn,
    onStop: nopFn,
    style: Object,
  };

  _onMove = nopFn;
  _onUp = nopFn;

  componentDidMount() {
    this._onMove = this.onMove.bind(this);
    this._onUp = this.onUp.bind(this);
  }

  _startDragging(evt) {
    evt.preventDefault();
    var doc = ReactDOM.findDOMNode(this).ownerDocument;
    doc.addEventListener('mousemove', this._onMove);
    doc.addEventListener('mouseup', this._onUp);
    this.props.onStart();
  }

  onMove(evt) {
    evt.preventDefault();
    this.props.onMove(evt.pageX, evt.pageY);
  }

  onUp(evt) {
    evt.preventDefault();
    var doc = ReactDOM.findDOMNode(this).ownerDocument;
    doc.removeEventListener('mousemove', this._onMove);
    doc.removeEventListener('mouseup', this._onUp);
    this.props.onStop();
  }

  render() {
    return (
      <div style={this.props.style} onMouseDown={this._startDragging.bind(this)} />
    );
  }
}
