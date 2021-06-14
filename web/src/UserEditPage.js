// Copyright 2021 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import {Button, Card, Col, Input, Row, Select, Switch} from 'antd';
import * as UserBackend from "./backend/UserBackend";
import * as OrganizationBackend from "./backend/OrganizationBackend";
import * as Setting from "./Setting";
import {LinkOutlined} from "@ant-design/icons";
import i18next from "i18next";
import CropperDiv from "./CropperDiv.js";
import * as AuthBackend from "./auth/AuthBackend";
import * as ApplicationBackend from "./backend/ApplicationBackend";
import * as Provider from "./auth/Provider";
import PasswordModal from "./PasswordModal";
import ResetModal from "./ResetModal";
import AffiliationSelect from "./common/AffiliationSelect";

import {Controlled as CodeMirror} from 'react-codemirror2'
import "codemirror/lib/codemirror.css"
require('codemirror/theme/material-darker.css');
require("codemirror/mode/javascript/javascript");

const { Option } = Select;

class UserEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      organizationName: props.organizationName !== undefined ? props.organizationName : props.match.params.organizationName,
      userName: props.userName !== undefined ? props.userName : props.match.params.userName,
      user: null,
      application: null,
      organizations: [],
    };
  }

  UNSAFE_componentWillMount() {
    this.getUser();
    this.getOrganizations();
    this.getDefaultApplication();
  }

  getUser() {
    UserBackend.getUser(this.state.organizationName, this.state.userName)
      .then((user) => {
        this.setState({
          user: user,
        });
      });
  }

  getOrganizations() {
    OrganizationBackend.getOrganizations("admin")
      .then((res) => {
        this.setState({
          organizations: (res.msg === undefined) ? res : [],
        });
      });
  }

  getDefaultApplication() {
    ApplicationBackend.getDefaultApplication("admin")
      .then((application) => {
        this.setState({
          application: application,
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

  unlinkUser(providerType) {
    const body = {
      providerType: providerType,
    };
    AuthBackend.unlink(body)
      .then((res) => {
        if (res.status === 'ok') {
          Setting.showMessage("success", `Linked successfully`);

          this.getUser();
        } else {
          Setting.showMessage("error", `Failed to unlink: ${res.msg}`);
        }
      });
  }

  getProviderLink(provider) {
    if (provider.type === "GitHub") {
      return `https://github.com/${this.getUserProperty(provider.type, "username")}`;
    } else if (provider.type === "Google") {
      return "https://mail.google.com";
    } else {
      return "";
    }
  }

  getUserProperty(providerType, propertyName) {
    const key = `oauth_${providerType}_${propertyName}`;
    return this.state.user.properties[key]
  }

  renderIdp(provider) {
    const linkedValue = this.state.user[provider.type.toLowerCase()];
    const profileUrl = this.getProviderLink(provider);
    const id = this.getUserProperty(provider.type, "id");
    const username = this.getUserProperty(provider.type, "username");
    const displayName = this.getUserProperty(provider.type, "displayName");
    const email = this.getUserProperty(provider.type, "email");
    let avatarUrl = this.getUserProperty(provider.type, "avatarUrl");

    if (avatarUrl === "" || avatarUrl === undefined) {
      avatarUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAQAAACROWYpAAAAHElEQVR42mNkoAAwjmoe1TyqeVTzqOZRzcNZMwB18wAfEFQkPQAAAABJRU5ErkJggg==";
    }

    let name = (username === undefined) ? displayName : `${displayName} (${username})`;
    if (name === undefined) {
      if (id !== undefined) {
        name = id;
      } else if (email !== undefined) {
        name = email;
      } else {
        name = linkedValue;
      }
    }

    return (
      <Row key={provider.name} style={{marginTop: '20px'}} >
        <Col style={{marginTop: '5px'}} span={3}>
          {
            Setting.getProviderLogo(provider)
          }
          <span style={{marginLeft: '5px'}}>
            {
              `${provider.type}:`
            }
          </span>
        </Col>
        <Col span={21} >
          <img style={{marginRight: '10px'}} width={30} height={30} src={avatarUrl} alt={name} />
          <span style={{width: '300px', display: "inline-block"}}>
            {
              linkedValue === "" ? (
                "(empty)"
              ) : (
                profileUrl === "" ? name : (
                  <a target="_blank" rel="noreferrer" href={profileUrl}>
                    {
                      name
                    }
                  </a>
                  )
              )
            }
          </span>
          {
            linkedValue === "" ? (
              <a key={provider.displayName} href={Provider.getAuthUrl(this.state.application, provider, "link")}>
                <Button style={{marginLeft: '20px', width: '80px'}} type="primary">{i18next.t("user:Link")}</Button>
              </a>
            ) : (
              <Button style={{marginLeft: '20px', width: '80px'}} onClick={() => this.unlinkUser(provider.type)}>{i18next.t("user:Unlink")}</Button>
            )
          }
        </Col>
      </Row>
    )
  }

  isSelfOrAdmin() {
    return (this.state.user.id === this.props.account?.id) || Setting.isAdminUser(this.props.account);
  }

  renderUser() {
    return (
      <Card size="small" title={
        <div>
          {i18next.t("user:Edit User")}&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type="primary" onClick={this.submitUserEdit.bind(this)}>{i18next.t("general:Save")}</Button>
        </div>
      } style={{marginLeft: '5px'}} type="inner">
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            {i18next.t("general:Organization")}:
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: '100%'}} disabled={!Setting.isAdminUser(this.props.account)} value={this.state.user.owner} onChange={(value => {this.updateUserField('owner', value);})}>
              {
                this.state.organizations.map((organization, index) => <Option key={index} value={organization.name}>{organization.name}</Option>)
              }
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            ID:
          </Col>
          <Col span={22} >
            <Input value={this.state.user.id} disabled={true} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            {i18next.t("general:Name")}:
          </Col>
          <Col span={22} >
            <Input value={this.state.user.name} disabled={true} onChange={e => {
              this.updateUserField('name', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            {i18next.t("general:Display name")}:
          </Col>
          <Col span={22} >
            <Input value={this.state.user.displayName} onChange={e => {
              this.updateUserField('displayName', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            {i18next.t("general:Avatar")}:
          </Col>
          <Col span={22} >
            <Row style={{marginTop: '20px'}} >
              <Col style={{marginTop: '5px'}} span={2}>
                {i18next.t("general:URL")}:
              </Col>
              <Col span={22} >
                <Input prefix={<LinkOutlined/>} value={this.state.user.avatar} onChange={e => {
                  this.updateUserField('avatar', e.target.value);
                }} />
              </Col>
            </Row>
            <Row style={{marginTop: '20px'}} >
              <Col style={{marginTop: '5px'}} span={2}>
                {i18next.t("general:Preview")}:
              </Col>
              <Col span={22} >
                <a target="_blank" rel="noreferrer" href={this.state.user.avatar}>
                  <img src={this.state.user.avatar} alt={this.state.user.avatar} height={90} style={{marginBottom: '20px'}}/>
                </a>
              </Col>
            </Row>
            <Row style={{marginTop: '20px'}}>
              <CropperDiv buttonText={`${i18next.t("user:Upload a photo")}...`} title={i18next.t("user:Upload a photo")} targetFunction={UserBackend.uploadAvatar} />
            </Row>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            {i18next.t("general:User type")}:
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: '100%'}} value={this.state.user.type} onChange={(value => {this.updateUserField('type', value);})}>
              {
                ['normal-user']
                  .map((item, index) => <Option key={index} value={item}>{item}</Option>)
              }
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            {i18next.t("general:Password")}:
          </Col>
          <Col span={22} >
            <PasswordModal user={this.state.user} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            {i18next.t("general:Email")}:
          </Col>
          <Col style={{paddingRight: '20px'}} span={11} >
            <Input value={this.state.user.email} disabled />
          </Col>
          <Col span={11} >
            { this.state.user.id === this.props.account?.id ? (<ResetModal org={this.state.application?.organizationObj} buttonText={i18next.t("user:Reset Email...")} destType={"email"} coolDownTime={60}/>) : null}
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            {i18next.t("general:Phone")}:
          </Col>
          <Col style={{paddingRight: '20px'}} span={11} >
            <Input value={this.state.user.phone} addonBefore={`+${this.state.application?.organizationObj.phonePrefix}`} disabled />
          </Col>
          <Col span={11} >
            { this.state.user.id === this.props.account?.id ? (<ResetModal org={this.state.application?.organizationObj} buttonText={i18next.t("user:Reset Phone...")} destType={"phone"} coolDownTime={60}/>) : null}
          </Col>
        </Row>
        {
          (this.state.application === null || this.state.user === null) ? null : (
            <AffiliationSelect application={this.state.application} user={this.state.user} onUpdateUserField={(key, value) => { return this.updateUserField(key, value)}} />
          )
        }
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            {i18next.t("user:Tag")}:
          </Col>
          <Col span={22} >
            <Input value={this.state.user.tag} onChange={e => {
              this.updateUserField('tag', e.target.value);
            }} />
          </Col>
        </Row>
        {
          !this.isSelfOrAdmin() ? null : (
            <Row style={{marginTop: '20px'}} >
              <Col style={{marginTop: '5px'}} span={2}>
                {i18next.t("user:Third-party logins")}:
              </Col>
              <Col span={22} >
                <div style={{marginBottom: 20}}>
                  {
                    this.state.application?.providers.filter(providerItem => Setting.isProviderVisible(providerItem)).map((providerItem, index) => this.renderIdp(providerItem.provider))
                  }
                </div>
              </Col>
            </Row>
          )
        }
        {
          !Setting.isAdminUser(this.props.account) ? null : (
            <React.Fragment>
              {/*<Row style={{marginTop: '20px'}} >*/}
              {/*  <Col style={{marginTop: '5px'}} span={2}>*/}
              {/*    {i18next.t("user:Properties")}:*/}
              {/*  </Col>*/}
              {/*  <Col span={22} >*/}
              {/*    <CodeMirror*/}
              {/*      value={JSON.stringify(this.state.user.properties, null, 4)}*/}
              {/*      options={{mode: 'javascript', theme: "material-darker"}}*/}
              {/*    />*/}
              {/*  </Col>*/}
              {/*</Row>*/}
              <Row style={{marginTop: '20px'}} >
                <Col style={{marginTop: '5px'}} span={2}>
                  {i18next.t("user:Is admin")}:
                </Col>
                <Col span={1} >
                  <Switch checked={this.state.user.isAdmin} onChange={checked => {
                    this.updateUserField('isAdmin', checked);
                  }} />
                </Col>
              </Row>
              <Row style={{marginTop: '20px'}} >
                <Col style={{marginTop: '5px'}} span={2}>
                  {i18next.t("user:Is global admin")}:
                </Col>
                <Col span={1} >
                  <Switch checked={this.state.user.isGlobalAdmin} onChange={checked => {
                    this.updateUserField('isGlobalAdmin', checked);
                  }} />
                </Col>
              </Row>
              <Row style={{marginTop: '20px'}} >
                <Col style={{marginTop: '5px'}} span={2}>
                  {i18next.t("user:Is forbidden")}:
                </Col>
                <Col span={1} >
                  <Switch checked={this.state.user.isForbidden} onChange={checked => {
                    this.updateUserField('isForbidden', checked);
                  }} />
                </Col>
              </Row>
            </React.Fragment>
          )
        }
      </Card>
    )
  }

  submitUserEdit() {
    let user = Setting.deepCopy(this.state.user);
    UserBackend.updateUser(this.state.organizationName, this.state.userName, user)
      .then((res) => {
        if (res.msg === "") {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            organizationName: this.state.user.owner,
            userName: this.state.user.name,
          });

          if (this.props.history !== undefined) {
            this.props.history.push(`/users/${this.state.user.owner}/${this.state.user.name}`);
          }
        } else {
          Setting.showMessage("error", res.msg);
          this.updateUserField('owner', this.state.organizationName);
          this.updateUserField('name', this.state.userName);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `Failed to connect to server: ${error}`);
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
            <Button type="primary" size="large" onClick={this.submitUserEdit.bind(this)}>{i18next.t("general:Save")}</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default UserEditPage;
