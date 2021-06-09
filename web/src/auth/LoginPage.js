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
import {Button, Checkbox, Col, Form, Input, Row} from "antd";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import * as AuthBackend from "./AuthBackend";
import * as ApplicationBackend from "../backend/ApplicationBackend";
import * as Provider from "./Provider";
import * as Util from "./Util";
import * as Setting from "../Setting";
import {GithubLoginButton, GoogleLoginButton} from "react-social-login-buttons";
import QqLoginButton from "./QqLoginButton";
import i18next from "i18next";

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      type: props.type,
      applicationName: props.applicationName !== undefined ? props.applicationName : (props.match === undefined ? null : props.match.params.applicationName),
      application: null,
      msg: null,
    };
  }

  UNSAFE_componentWillMount() {
    if (this.state.type === "login") {
      this.getApplication();
    } else if (this.state.type === "code") {
      this.getApplicationLogin();
    } else {
      Util.showMessage("error", `Unknown authentication type: ${this.state.type}`);
    }
  }

  getApplicationLogin() {
    const oAuthParams = Util.getOAuthGetParameters();
    AuthBackend.getApplicationLogin(oAuthParams)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({
            application: res.data,
          });
        } else {
          // Util.showMessage("error", res.msg);
          this.setState({
            application: res.data,
            msg: res.msg,
          });
        }
      });
  }

  getApplication() {
    if (this.state.applicationName === null) {
      return;
    }

    ApplicationBackend.getApplication("admin", this.state.applicationName)
      .then((application) => {
        this.setState({
          application: application,
        });
      });
  }

  getApplicationObj() {
    if (this.props.application !== undefined) {
      return this.props.application;
    } else {
      return this.state.application;
    }
  }

  onFinish(values) {
    values["type"] = this.state.type;
    const oAuthParams = Util.getOAuthGetParameters();
    AuthBackend.login(values, oAuthParams)
      .then((res) => {
        if (res.status === 'ok') {
          const responseType = this.state.type;
          if (responseType === "login") {
            Util.showMessage("success", `Logged in successfully`);
            Setting.goToLink("/");
          } else if (responseType === "code") {
            const code = res.data;
            Setting.goToLink(`${oAuthParams.redirectUri}?code=${code}&state=${oAuthParams.state}`);
            // Util.showMessage("success", `Authorization code: ${res.data}`);
          }
        } else {
          Util.showMessage("error", `Failed to log in: ${res.msg}`);
        }
      });
  };

  getLoginButton(type) {
    if (type === "GitHub") {
      return <GithubLoginButton />
    } else if (type === "Google") {
      return <GoogleLoginButton />
    } else if (type === "QQ") {
      return <QqLoginButton />
    } else {
      return `Log in with ${type}`;
    }
  }

  renderProviderLogo(provider, application, width, margin, size) {
    if (size === "small") {
      return (
        <a key={provider.displayName} href={Provider.getAuthUrl(application, provider, "signup")}>
          <img width={width} height={width} src={Provider.getAuthLogo(provider)} alt={provider.displayName} style={{margin: margin}} />
        </a>
      )
    } else {
      return (
        <div key={provider.displayName} style={{marginBottom: "10px"}}>
          <a href={Provider.getAuthUrl(application, provider, "signup")}>
            {
              this.getLoginButton(provider.type)
            }
          </a>
        </div>
      )
    }
  }

  renderForm(application) {
    if (this.state.msg !== null) {
      return Util.renderMessage(this.state.msg)
    }

    if (application.enablePassword) {
      return (
        <Form
          name="normal_login"
          initialValues={{
            organization: application.organization,
            remember: true
          }}
          onFinish={this.onFinish.bind(this)}
          style={{width: "250px"}}
          size="large"
        >
          <Form.Item
            style={{height: 0, visibility: "hidden"}}
            name="organization"
            rules={[
              {
                required: true,
                message: 'Please input your organization!',
              },
            ]}
          >
          </Form.Item>
          <Form.Item
            name="username"
            rules={[{ required: true, message: i18next.t("login:Please input your username, Email or phone!") }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder={i18next.t("login:username, Email or phone")}
              disabled={!application.enablePassword}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: i18next.t("login:Please input your password!") }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder={i18next.t("login:Password")}
              disabled={!application.enablePassword}
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox style={{float: "left"}} disabled={!application.enablePassword}>
                {i18next.t("login:Auto login")}
              </Checkbox>
            </Form.Item>
            <a style={{float: "right"}} onClick={() => {
              Setting.goToForget(this, application);
            }}>
              {i18next.t("login:Forgot password?")}
            </a>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{width: "100%"}}
              disabled={!application.enablePassword}
            >
              {i18next.t("login:Sign In")}
            </Button>
            {
              !application.enableSignUp ? null : (
                <div style={{float: "right"}}>
                  {i18next.t("login:No account yet?")}&nbsp;
                  <a onClick={() => {
                    Setting.goToSignup(this, application);
                  }}>
                    {i18next.t("login:sign up now")}
                  </a>
                </div>
              )
            }
          </Form.Item>
          <Form.Item>
            {
              application.providerObjs.filter(provider => Setting.isProviderVisibleForSignUp(provider)).map(provider => {
                return this.renderProviderLogo(provider, application, 30, 5, "small");
              })
            }
          </Form.Item>
        </Form>
      );
    } else {
      return (
        <div style={{marginTop: "20px"}}>
          <div style={{fontSize: 16, textAlign: "left"}}>
            Sign in&nbsp;
            <a target="_blank" rel="noreferrer" href={application.homepageUrl}>
              <span style={{fontWeight: "bold"}}>
                {application.displayName}
              </span>
            </a>
            &nbsp;with:
          </div>
          <br/>
          {
            application.providerObjs.filter(provider => Setting.isProviderVisibleForSignUp(provider)).map(provider => {
              return this.renderProviderLogo(provider, application, 40, 10, "big");
            })
          }
          {
            !application.enableSignUp ? null : (
              <div>
                <br/>
                <div style={{float: "right"}}>
                  {i18next.t("login:No account yet?")}&nbsp;
                  <a onClick={() => {
                    Setting.goToSignup(this, application);
                  }}>
                    {i18next.t("login:sign up now")}
                  </a>
                </div>
              </div>
            )
          }
        </div>
      )
    }
  }

  render() {
    const application = this.getApplicationObj();
    if (application === null) {
      return Util.renderMessageLarge(this, this.state.msg);
    }

    return (
      <Row>
        <Col span={24} style={{display: "flex", justifyContent: "center"}}>
          <div style={{marginTop: "80px", textAlign: "center"}}>
            {
              Setting.renderHelmet(application)
            }
            {
              Setting.renderLogo(application)
            }
            {/*{*/}
            {/*  this.state.clientId !== null ? "Redirect" : null*/}
            {/*}*/}
            {
              this.renderForm(application)
            }
          </div>
        </Col>
      </Row>
    )
  }
}

export default LoginPage;
