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
import Draggable from './Draggable';

let styles = {
  container: {
    minHeight: '100%',
    display: 'flex',
    minWidth: 0,
    flex: 1,
  },

  dragger: {
    cursor: 'ew-resize',
    borderWidth: '0 0px',
    backgroundColor: '#dedede',
    width: 1,
    borderStyle: 'solid',
    borderColor: 'white',
  },

  draggerMoving: {
    backgroundColor: '#aaf',
  },

  rightPane: {
    display: 'flex',
  },

  leftPane: {
    display: 'flex',
    minWidth: 0,
    flex: 1,
  },
};

export default class SplitPane extends React.Component {
  componentWillMount() {
    this.setState({
      width: this.props.initialWidth
    });
  }

  onMove(x) {
    let node = ReactDOM.findDOMNode(this);
    this.setState({
      width: (node.offsetLeft + node.offsetWidth) - x,
    });
  }

  render() {
    let dragStyle = styles.dragger;

    if (this.state.moving) {
      dragStyle = Object.assign({}, dragStyle, styles.draggerMoving);
    }

    let rightStyle = Object.assign({}, styles.rightPane, {
      width: this.state.width
    });

    let content = [
      <div className="left" style={styles.leftPane}>
        {this.props.left}
      </div>
    ];

    if (this.props.right) {
      content.push(
        <Draggable
          style={dragStyle}
          onStart={() => this.setState({moving: true})}
          onMove={x => this.onMove(x)}
          onStop={() => this.setState({moving: false})} />
      );

      content.push(
        <div className="right" style={rightStyle}>
          {this.props.right}
        </div>
      );
    }

    return (
      <div className="split-pane" style={styles.container}>
        {content}
      </div>
    );
  }
}
