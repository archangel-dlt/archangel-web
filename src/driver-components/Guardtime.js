import React, { Component } from 'react'
import Guardtime from '../driver/Guardtime';
import { DialogBox, DialogRow } from "./Dialog";

class GuardtimeLoginBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      credentials: {
        username: '',
        password: '',
        url: ''
      }
    };
  } // constructor

  solicitCredentials(username, password, url) {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      this.setState({
        credentials: {
          username: username,
          password: password,
          url: url
        }
      });
      this.show();
    });
  } // solicitCredentials

  show() { this.visible(true); }
  hide() { this.visible(false); }
  visible(state) {
    this.setState({ visible: state });
  } // visible

  login() {
    this.hide();
    this.resolve(this.state.credentials);
  } // login

  cancel() {
    this.hide();
    this.reject(new Error("Login cancelled"));
  } // cancel

  textBox(fieldName, type="text") {
    return (
      <input name={fieldName}
             className="form-control"
             type={type}
             value={this.state.credentials[fieldName]}
             onChange={ e => this.updateField(fieldName, e.target.value)}
      />
    )
  } // textBox

  updateField(fieldName, value) {
    const credentials = this.state.credentials
    credentials[fieldName] = value;
    this.setState({ credentials: credentials });
  } // updateField

  hasCreds() {
    const credentials = this.state.credentials;
    return credentials.username && credentials.password && credentials.url;
  } // hasCreds

  render() {
    return (
      <DialogBox
          show={this.state.visible}
          title="Guardtime Login"
          canOK={() => this.hasCreds()}
          onOK={() => this.login()}
          onClose={() => this.cancel()}
          labelOK="Login">
        <DialogRow title="Username">{ this.textBox('username') }</DialogRow>
        <DialogRow title="Password">{ this.textBox('password', 'password') }</DialogRow>
        <DialogRow title="Guardtime URL">{ this.textBox('url') }</DialogRow>
      </DialogBox>
    )
  }
} // class GuardtimeLoginBox

class ReactGuardtime extends Guardtime {
  hasCreds_() {
    return this.username && this.password && this.guardtime_url;
  } // hasCreds

  async solicitCredentials() {
    const {username, password, url} =
      await this.loginBox.solicitCredentials(
        this.username,
        this.password,
        this.guardtime_url
      );
    this.username = username;
    this.password = password;
    this.guardtime_url = url;
  } // solicitCredentials

  async gt_(method, params, payload) {
    if (!this.hasCreds_())
      await this.solicitCredentials();

    try {
      return await super.gt_(method, params, payload)
    } catch (err) {
      if (err.status === 401) {
        this.username = '';
        this.password = '';
      }
      throw err;
    }
  } // gt_

  ////////////////////
  render() {
    return <GuardtimeLoginBox ref={loginBox => this.loginBox = loginBox}/>
  }
} // ReactGuardtime

function createGuardtimeDriver(username, password, url = 'https://tryout-catena-db.guardtime.net/api/v2/signatures') {
  return new ReactGuardtime(username, password, url);
} // createGuardtimeDriver

export default createGuardtimeDriver;