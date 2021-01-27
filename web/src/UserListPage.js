import React from "react";
import {Button, Col, Popconfirm, Row, Table} from 'antd';
import { Link } from 'react-router-dom'
import moment from "moment";
import * as Setting from "./Setting";
import * as UserBackend from "./backend/UserBackend";

class UserListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      users: null,
    };
  }

  componentWillMount() {
    this.getUsers();
  }

  getUsers() {
    UserBackend.getUsers("admin")
      .then((res) => {
        this.setState({
          users: res,
        });
      });
  }

  newUser() {
    return {
      owner: "admin", // this.props.account.username,
      name: `user_${this.state.users.length}`,
      createdTime: moment().format(),
      password: "123456",
      passwordType: "plain",
      displayName: `New User - ${this.state.users.length}`,
      email: "user@example.com",
      phone: "1-12345678",
    }
  }

  addUser() {
    const newUser = this.newUser();
    UserBackend.addUser(newUser)
      .then((res) => {
          Setting.showMessage("success", `User added successfully`);
          this.setState({
            users: Setting.prependRow(this.state.users, newUser),
          });
        }
      )
      .catch(error => {
        Setting.showMessage("error", `User failed to add: ${error}`);
      });
  }

  deleteUser(i) {
    UserBackend.deleteUser(this.state.users[i])
      .then((res) => {
          Setting.showMessage("success", `User deleted successfully`);
          this.setState({
            users: Setting.deleteRow(this.state.users, i),
          });
        }
      )
      .catch(error => {
        Setting.showMessage("error", `User failed to delete: ${error}`);
      });
  }

  renderTable(users) {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '120px',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text, record, index) => {
          return (
            <Link to={`/users/${text}`}>{text}</Link>
          )
        }
      },
      {
        title: 'Created Time',
        dataIndex: 'createdTime',
        key: 'createdTime',
        width: '160px',
        sorter: (a, b) => a.createdTime.localeCompare(b.createdTime),
        render: (text, record, index) => {
          return Setting.getFormattedDate(text);
        }
      },
      {
        title: 'PasswordType',
        dataIndex: 'passwordType',
        key: 'passwordType',
        width: '150px',
        sorter: (a, b) => a.passwordType.localeCompare(b.passwordType),
      },
      {
        title: 'Password',
        dataIndex: 'password',
        key: 'password',
        width: '150px',
        sorter: (a, b) => a.password.localeCompare(b.password),
      },
      {
        title: 'Display Name',
        dataIndex: 'displayName',
        key: 'displayName',
        // width: '100px',
        sorter: (a, b) => a.displayName.localeCompare(b.displayName),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        width: '150px',
        sorter: (a, b) => a.email.localeCompare(b.email),
      },
      {
        title: 'Phone',
        dataIndex: 'phone',
        key: 'phone',
        width: '120px',
        sorter: (a, b) => a.phone.localeCompare(b.phone),
      },
      {
        title: 'Action',
        dataIndex: '',
        key: 'op',
        width: '170px',
        render: (text, record, index) => {
          return (
            <div>
              <Button style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} type="primary" onClick={() => Setting.goToLink(`/users/${record.name}`)}>Edit</Button>
              <Popconfirm
                title={`Sure to delete user: ${record.name} ?`}
                onConfirm={() => this.deleteUser(index)}
              >
                <Button style={{marginBottom: '10px'}} type="danger">Delete</Button>
              </Popconfirm>
            </div>
          )
        }
      },
    ];

    return (
      <div>
        <Table columns={columns} dataSource={users} rowKey="name" size="middle" bordered pagination={{pageSize: 100}}
               title={() => (
                 <div>
                   Users&nbsp;&nbsp;&nbsp;&nbsp;
                   <Button type="primary" size="small" onClick={this.addUser.bind(this)}>Add</Button>
                 </div>
               )}
               loading={users === null}
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        <Row style={{width: "100%"}}>
          <Col span={1}>
          </Col>
          <Col span={22}>
            {
              this.renderTable(this.state.users)
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
      </div>
    );
  }
}

export default UserListPage;
