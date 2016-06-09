import React from 'react';
import JwtDetail from '../component/JwtDetail';
import ExpandableSection from '../component/ExpandableSection';
import { parseJwt } from '../utils';
import '../../css/dev-tools-request-detail-panel.less';

export default class DevToolsRequestDetailPanel extends React.Component {
  onClose() {
    this.props.onClose();
  }

  _translateRequestType(type) {
    switch (type) {
      case 'query_string':
        return 'Query string';

      case 'response_header':
        return 'Response header';

      case 'request_header':
        return 'Request header';

      default:
        return 'Unknown';
    }
  }

  render() {
    let items = [];
    let request = this.props.request;

    request.jwts.forEach((jwt, index) => {
      items.push(
        <div key={index}>
          <JwtDetail
            jwt={parseJwt(jwt.value)}
            showRaw={true}
            additionalContent={[{
              name: this._translateRequestType(jwt.type),
              value: jwt.name
            }]} />
        </div>
      );
    });

    return (
      <div id="dev-tools-request-detail-panel">
        <div className="sub-menu">
          <i className="fa fa-times close-button" aria-hidden="true" onClick={this.onClose.bind(this)}></i>
          <div className="item title">
            {request.method} {request.url}
          </div>
        </div>
        <div className="content">
          {items}
        </div>
      </div>
    );
  }
}
