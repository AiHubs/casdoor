// Copyright 2022 The Casdoor Authors. All Rights Reserved.
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

import * as Setting from "./Setting";
import {Redirect, Route, Switch} from "react-router-dom";
import SignupPage from "./auth/SignupPage";
import SelfLoginPage from "./auth/SelfLoginPage";
import LoginPage from "./auth/LoginPage";
import SelfForgetPage from "./auth/SelfForgetPage";
import ForgetPage from "./auth/ForgetPage";
import React from "react";
import PromptPage from "./auth/PromptPage";

class EntryPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      application: null,
    };
  }

  renderHomeIfLoggedIn(component) {
    if (this.props.account !== null && this.props.account !== undefined) {
      return <Redirect to="/" />;
    } else {
      return component;
    }
  }
  renderLoginIfNotLoggedIn(component) {
    if (this.props.account === null) {
      sessionStorage.setItem("from", window.location.pathname);
      return <Redirect to="/login" />;
    } else if (this.props.account === undefined) {
      return null;
    } else {
      return component;
    }
  }

  render() {
    const onUpdateApplication = (application) => {
      this.setState({
        application: application,
      });
    };

    return <div className="loginBackground" style={{backgroundImage: Setting.inIframe() || Setting.isMobile() ? null : `url(${this.state.application?.formBackgroundUrl})`}}>
      <Switch>
        <Route exact path="/signup" render={(props) => this.renderHomeIfLoggedIn(<SignupPage {...this.props} onUpdateApplication={onUpdateApplication} {...props} />)} />
        <Route exact path="/signup/:applicationName" render={(props) => this.renderHomeIfLoggedIn(<SignupPage {...this.props} onUpdateApplication={onUpdateApplication} {...props} />)} />
        <Route exact path="/login" render={(props) => this.renderHomeIfLoggedIn(<SelfLoginPage {...this.props} onUpdateApplication={onUpdateApplication} {...props} />)} />
        <Route exact path="/login/:owner" render={(props) => this.renderHomeIfLoggedIn(<SelfLoginPage {...this.props} onUpdateApplication={onUpdateApplication} {...props} />)} />
        <Route exact path="/auto-signup/oauth/authorize" render={(props) => <LoginPage {...this.props} type={"code"} mode={"signup"} onUpdateApplication={onUpdateApplication}{...props} />} />
        <Route exact path="/signup/oauth/authorize" render={(props) => <SignupPage {...this.props} onUpdateApplication={onUpdateApplication} {...props} />} />
        <Route exact path="/login/oauth/authorize" render={(props) => <LoginPage {...this.props} type={"code"} mode={"signin"} onUpdateApplication={onUpdateApplication} {...props} />} />
        <Route exact path="/login/saml/authorize/:owner/:applicationName" render={(props) => <LoginPage {...this.props} type={"saml"} mode={"signin"} onUpdateApplication={onUpdateApplication} {...props} />} />
        <Route exact path="/forget" render={(props) => this.renderHomeIfLoggedIn(<SelfForgetPage onUpdateApplication={onUpdateApplication} {...props} />)} />
        <Route exact path="/forget/:applicationName" render={(props) => this.renderHomeIfLoggedIn(<ForgetPage onUpdateApplication={onUpdateApplication} {...props} />)} />
        <Route exact path="/prompt" render={(props) => this.renderLoginIfNotLoggedIn(<PromptPage {...this.props} onUpdateApplication={onUpdateApplication} {...props} />)} />
        <Route exact path="/prompt/:applicationName" render={(props) => this.renderLoginIfNotLoggedIn(<PromptPage {...this.props} onUpdateApplication={onUpdateApplication} {...props} />)} />
      </Switch>
    </div>;
  }
}

export default EntryPage;
