import React from 'react';
import JwtDetail from '../component/JwtDetail';
import { parseJwt } from '../utils';
import '../../css/dev-tools-jwt-detail-panel.less';

export default class DevToolsJwtDetailPanel extends React.Component {
  onClose() {
    this.props.onClose();
  }

  render() {
    let type = null;
    let data = this.props.data;
    let jwt = parseJwt(data.value);

    switch (data.source) {
      case 'cookie':
        type = "Cookie";
        break;

      case 'request':
        let capitalizedType = data.type[0].toUpperCase() + data.type.substring(1);
        type = capitalizedType + " header";
        break;

      case 'storage':
        switch (data.type) {
          case 'session':
            type = "Session storage";
            break;

          case 'local':
            type = "Local storage";
            break;
        }
        break;
    }

    return (
      <div id="dev-tools-jwt-detail-panel">
        <div className="sub-menu">
          <i className="fa fa-times close-button" aria-hidden="true" onClick={this.onClose.bind(this)}></i>
          <div className="item">
            {data.name}
          </div>
        </div>
        <div className="content">
          <JwtDetail jwt={jwt} showRaw={true} />
        </div>
      </div>
    );
  }
}
