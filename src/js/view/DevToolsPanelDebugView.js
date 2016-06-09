import React from 'react';
import JwtDetail from '../component/JwtDetail';
import JwtTextArea from '../component/JwtTextArea';
import StormpathCredits from './StormpathCredits';
import { parseJwt } from '../utils';
import '../../css/dev-tools-panel-debug-view.less';

export default class DevToolsPanelDebugView extends React.Component {
  state = {
    jwt: ''
  };

  onJwtInputChange(e) {
    this.setState({
      jwt: e.value
    })
  }

  render() {
    let jwtValue = this.state.jwt;
    let parsedJwt = parseJwt(jwtValue);
    return (
      <div id="dev-tools-panel-debug-view">
        <div className="content top">
          <div className="left">
            Encoded
          </div>
          <div className="right">
            Decoded
          </div>
        </div>
        <div className="content bottom">
          <div className="left">
            <JwtTextArea
              colorize={true}
              placeholder="Paste your JWT here"
              onChange={this.onJwtInputChange.bind(this)}
              jwt={jwtValue} />
          </div>
          <div className="right">
            { jwtValue === '' ?
              <div className="no-jwt message"><i className="fa fa-long-arrow-left" aria-hidden="true"></i> Nothing to show</div> :
              (parsedJwt ?
                <JwtDetail jwt={parsedJwt} /> :
                <p className="error message">The JWT that you've entered isn't valid.</p>
              )
            }
          </div>
        </div>
        <StormpathCredits />
      </div>
    );
  }
}
