import React from 'react';
import JwtDetail from '../component/JwtDetail';
import JwtTextArea from '../component/JwtTextArea';
import StormpathCredits from './StormpathCredits';
import { parseJwt } from '../utils';
import { getClipboardJwt, getPopupState, setPopupState } from '../backgroundApi';
import '../../css/popup-debug-view.less';

export default class PopupDebugView extends React.Component {
  state = {
    jwt: '',
    showCredits: true
  };

  componentWillMount() {
    getPopupState().then((state) => {
      if (state.jwt) {
        return this.setState(state);
      }

      getClipboardJwt().then((clipboardJwt) => {
        this.setState({
          showCredits: clipboardJwt === '',
          jwt: clipboardJwt
        });
      });
    });
  }

  setState(state) {
    super.setState(state);
    setPopupState(state);
  }

  onJwtInputChange(e) {
    let value = e.value || '';

    this.setState({
      jwt: value,
      showCredits: value === ''
    });
  }

  render() {
    let content = [];
    let jwt = this.state.jwt;
    let parsedJwt = jwt ? parseJwt(this.state.jwt) : jwt;

    content.push(
      <div className="top">
        <JwtTextArea
          placeholder="Paste your JWT here"
          onChange={this.onJwtInputChange.bind(this)}
          autosize={true}
          jwt={jwt} />
      </div>
    );

    if (jwt !== '' && parsedJwt) {
      content.push(
        <div className="bottom">
          <JwtDetail jwt={parsedJwt} />
        </div>
      );
    }

    return (
      <div id="popup-debug-view">
        {content}
        { this.state.showCredits ?
          <StormpathCredits /> : null }
      </div>
    );
  }
}
