import React from "react";
import {Button, Card, Col, Input, Row} from 'antd';
import * as UserBackend from "./backend/UserBackend";
import * as Setting from "./Setting";

class UserEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      userName: props.match.params.userName,
      user: null,
    };
  }

  componentWillMount() {
    this.getUser();
  }

  getUser() {
    UserBackend.getUser("admin", this.state.userName)
      .then((user) => {
        this.setState({
          user: user,
        });
      });
  }

  parseUserField(key, value) {
    // if ([].includes(key)) {
    //   value = Setting.myParseInt(value);
    // }
    return value;
  }

  updateUserField(key, value) {
    value = this.parseUserField(key, value);

    let user = this.state.user;
    user[key] = value;
    this.setState({
      user: user,
    });
  }

  renderUser() {
    return (
      <Card size="small" title={
        <div>
          Edit User&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type="primary" onClick={this.submitUserEdit.bind(this)}>Save</Button>
        </div>
      } style={{marginLeft: '5px'}} type="inner">
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Name:
          </Col>
          <Col span={22} >
            <Input value={this.state.user.name} onChange={e => {
              this.updateUserField('name', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Password Type:
          </Col>
          <Col span={22} >
            <Input value={this.state.user.passwordType} onChange={e => {
              this.updateUserField('passwordType', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Password:
          </Col>
          <Col span={22} >
            <Input value={this.state.user.password} onChange={e => {
              this.updateUserField('password', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Display Name:
          </Col>
          <Col span={22} >
            <Input value={this.state.user.displayName} onChange={e => {
              this.updateUserField('displayName', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Email:
          </Col>
          <Col span={22} >
            <Input value={this.state.user.email} onChange={e => {
              this.updateUserField('email', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Phone:
          </Col>
          <Col span={22} >
            <Input value={this.state.user.phone} onChange={e => {
              this.updateUserField('phone', e.target.value);
            }} />
          </Col>
        </Row>
      </Card>
    )
  }

  submitUserEdit() {
    let user = Setting.deepCopy(this.state.user);
    UserBackend.updateUser(this.state.user.owner, this.state.userName, user)
      .then((res) => {
        if (res) {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            userName: this.state.user.name,
          });
          this.props.history.push(`/users/${this.state.user.name}`);
        } else {
          Setting.showMessage("error", `failed to save: server side failure`);
          this.updateUserField('name', this.state.userName);
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
              this.state.user !== null ? this.renderUser() : null
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
        <Row style={{margin: 10}}>
          <Col span={2}>
          </Col>
          <Col span={18}>
            <Button type="primary" size="large" onClick={this.submitUserEdit.bind(this)}>Save</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default UserEditPage;
