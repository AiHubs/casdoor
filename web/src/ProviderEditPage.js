import React from "react";
import {Button, Card, Col, Input, Row} from 'antd';
import * as ProviderBackend from "./backend/ProviderBackend";
import * as Setting from "./Setting";

class ProviderEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      providerName: props.match.params.providerName,
      provider: null,
    };
  }

  componentWillMount() {
    this.getProvider();
  }

  getProvider() {
    ProviderBackend.getProvider("admin", this.state.providerName)
      .then((provider) => {
        this.setState({
          provider: provider,
        });
      });
  }

  parseProviderField(key, value) {
    // if ([].includes(key)) {
    //   value = Setting.myParseInt(value);
    // }
    return value;
  }

  updateProviderField(key, value) {
    value = this.parseProviderField(key, value);

    let provider = this.state.provider;
    provider[key] = value;
    this.setState({
      provider: provider,
    });
  }

  renderProvider() {
    return (
      <Card size="small" title={
        <div>
          Edit Provider&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type="primary" onClick={this.submitProviderEdit.bind(this)}>Save</Button>
        </div>
      } style={{marginLeft: '5px'}} type="inner">
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Name:
          </Col>
          <Col span={22} >
            <Input value={this.state.provider.name} onChange={e => {
              this.updateProviderField('name', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Display Name:
          </Col>
          <Col span={22} >
            <Input value={this.state.provider.displayName} onChange={e => {
              this.updateProviderField('displayName', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            type:
          </Col>
          <Col span={22} >
            <Input value={this.state.provider.type} onChange={e => {
              this.updateProviderField('type', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Client Id:
          </Col>
          <Col span={22} >
            <Input value={this.state.provider.clientId} onChange={e => {
              this.updateProviderField('clientId', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Client Secret:
          </Col>
          <Col span={22} >
            <Input value={this.state.provider.clientSecret} onChange={e => {
              this.updateProviderField('clientSecret', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Provider Url:
          </Col>
          <Col span={22} >
            <Input value={this.state.provider.providerUrl} onChange={e => {
              this.updateProviderField('providerUrl', e.target.value);
            }} />
          </Col>
        </Row>
      </Card>
    )
  }

  submitProviderEdit() {
    let provider = Setting.deepCopy(this.state.provider);
    ProviderBackend.updateProvider(this.state.provider.owner, this.state.providerName, provider)
      .then((res) => {
        if (res) {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            providerName: this.state.provider.name,
          });
          this.props.history.push(`/providers/${this.state.provider.name}`);
        } else {
          Setting.showMessage("error", `failed to save: server side failure`);
          this.updateProviderField('name', this.state.providerName);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  render() {
    return (
      <div>
        <Row style={{width: "100%"}}>
          <Col span={1}>
          </Col>
          <Col span={22}>
            {
              this.state.provider !== null ? this.renderProvider() : null
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
        <Row style={{margin: 10}}>
          <Col span={2}>
          </Col>
          <Col span={18}>
            <Button type="primary" size="large" onClick={this.submitProviderEdit.bind(this)}>Save</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ProviderEditPage;
