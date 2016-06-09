import React from 'react';
import JwtDetail from '../component/JwtDetail';
import { parseJwt } from '../utils';
import '../../css/popup-jwt-detail-view.less';

export default class PopupJwtDetailView extends React.Component {
  onClose() {
    this.props.onClose();
  }

  render() {
    let data = this.props.data;
    let parsedJwt = parseJwt(data.value);

    return (
      <div id="popup-jwt-detail-view">
        <div className="top">
          <a href="#" onClick={this.onClose.bind(this)}><i className="fa fa-arrow-left icon" aria-hidden="true"></i> Back</a>
        </div>
        <div className="bottom">
          <JwtDetail jwt={parsedJwt} showRaw={true} />
        </div>
      </div>
    );
  }
}
