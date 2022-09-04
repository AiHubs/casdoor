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

import React, {Component} from "react";
import * as Setting from "./Setting";
import "./index.css";
import {getTheme, setThemeColor} from "./Theme";

class SelectThemeBox extends Component {
  constructor(props) {
    super(props);
    this.state = {theme: getTheme()};
    setThemeColor(this.state.theme);
    this.updateLogo();
  }

  get icon() {
    return (
      `${Setting.StaticBaseUrl}/img/${this.state.theme}.svg`
    );
  }

  changeTheme() {
    let theme = getTheme();
    theme = (theme === "light") ? "dark" : "light";
    this.setState({theme}, () => {
      this.updateLogo();
    });
    setThemeColor(theme);
  }

  updateLogo() {
    const logo = this.state.theme === "light" ? `${Setting.StaticBaseUrl}/img/casdoor-logo_1185x256.png` :
      `${Setting.StaticBaseUrl}/img/casdoor-logo_1185x256_dark.png`;
    this.props.updateLogo(logo);
  }

  render() {
    return (
      <div className="themeBox" onClick={() => this.changeTheme()} style={{background: `url(${this.icon})`}}> </div>
    );
  }
}

export default SelectThemeBox;
