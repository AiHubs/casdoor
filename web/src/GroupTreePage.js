// Copyright 2023 The Casdoor Authors. All Rights Reserved.
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

import {HolderOutlined, UsergroupAddOutlined} from "@ant-design/icons";
import {Col, Empty, Row, Tree, message} from "antd";
import React from "react";
import * as GroupBackend from "./backend/GroupBackend";
import OrganizationSelect from "./common/select/OrganizationSelect";
import UserListPage from "./UserListPage";

class GroupTreePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      organizationName: props.organizationName !== undefined ? props.organizationName : props.match.params.organizationName,
      treeData: [],
      selectedGroup: null,
    };
  }

  UNSAFE_componentWillMount() {
    this.getTreeData();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.organizationName !== prevState.organizationName) {
      this.getTreeData();
    }
  }

  getTreeData() {
    GroupBackend.getGroups(this.state.organizationName, true).then((res) => {
      if (res.status === "ok") {
        const tree = res.data?.map(i => this.setTreeIcon(i));
        this.setState({
          treeData: tree,
        });
      } else {
        message.error(res.msg);
      }
    });
  }

  setTreeIcon(treeData) {
    const haveChildren = Array.isArray(treeData.children) && treeData.children.length > 0;
    return {
      key: treeData.key,
      title: treeData.title,
      icon: treeData.type === "Physical" ? <UsergroupAddOutlined /> : <HolderOutlined />,
      children: haveChildren ? treeData.children.map(i => this.setTreeIcon(i)) : [],
    };
  }

  renderTree() {
    const onSelect = (selectedKeys, info) => {
      this.setState({
        selectedGroup: info.node,
      });
    };

    if (this.state.treeData.length === 0) {
      return <Empty />;
    }

    return (
      <Tree
        defaultExpandedKeys={["0"]}
        defaultSelectedKeys={["0"]}
        defaultExpandAll={true}
        onSelect={onSelect}
        showIcon={true}
        treeData={this.state.treeData}
      />
    );
  }

  render() {
    return (
      <React.Fragment>
        <Row>
          <Col span={4}
          >
            <Row>
              <Col span={24} style={{textAlign: "center"}}>
                <OrganizationSelect
                  initValue={this.state.organizationName}
                  style={{width: "90%"}}
                  onChange={(value) => {
                    this.setState({
                      organizationName: value,
                      selectedGroup: null,
                    });
                  }}
                />
              </Col>
            </Row>
            <Row style={{marginTop: 20}}>
              <Col span={24} style={{textAlign: "center"}}>
                {this.renderTree()}
              </Col>
            </Row>
          </Col>
          <Col span={20}>
            <UserListPage
              organizationName={this.state.organizationName}
              selectedGroup={this.state.selectedGroup !== null ? this.state.selectedGroup : null}
              {...this.props} />
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

export default GroupTreePage;
