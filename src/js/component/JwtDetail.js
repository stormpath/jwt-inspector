import React from 'react';
import ExpandableSection from './ExpandableSection';

export default class JwtDetail extends React.Component {
  render() {
    let jwt = this.props.jwt;
    let additionalContent = [];

    if (this.props.additionalContent) {
      this.props.additionalContent.forEach((item) => {
        additionalContent.push(
          <ExpandableSection {...item} />
        );
      });
    }

    if (this.props.showRaw){
      additionalContent.push(
        <ExpandableSection name="JWT" value={jwt.raw} copyable={true} />
      );
    }

    return (
      <div className="jwt">
        {additionalContent}
        <ExpandableSection name="Header" value={jwt.header} format="json" />
        <ExpandableSection name="Payload" value={jwt.body} format="json" />
        <ExpandableSection name="Signature" value={jwt.signature} />
      </div>
    );
  }
}
