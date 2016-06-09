import React from 'react';
import '../../css/stormpath-credits.less';

export default class StormpathCredits extends React.Component {
  render() {
    return (
      <div id="stormpath-credits">
        <a href="https://stormpath.com/" target="blank">Created with <i className="fa fa-heart" aria-hidden="true"></i> by Stormpath</a>
      </div>
    );
  }
}
