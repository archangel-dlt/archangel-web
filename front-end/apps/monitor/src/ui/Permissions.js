import React, { Component, Fragment } from 'react';

class Granter extends Component {
  constructor(props) {
    super(props);
    this.driver = props.driver;
    this.contractOwner = props.owner;
    this.state = { }
  } // constructor

  shouldComponentUpdate(nextProps) {
    if (nextProps.owner === this.contractOwner)
      return false;

    this.contractOwner = nextProps.owner;
    return true;
  } // shouldComponentUpdate

  render() {
    if (this.driver.account() !== this.contractOwner)
      return (<div/>)

    return (
      <div className="border border-primary row p-2">
        <div className="row col-12">
          <strong>Grant Contract Write Permission</strong>
        </div>
        <div className="row col-12">
          <div className="col-2">Name</div>
          <input name="name"
                 className="form-control col"
                 hint="Name"
                 type="text"
                 onChange={ e => this.setState({name: e.target.value}) }
          />
        </div>
        <div className="row col-12">
          <div className="col-2">Address</div>
          <input name="address"
                 className="form-control col"
                 hint="Address to unlock"
                 type="text"
                 onChange={ e => this.setState({address: e.target.value}) }
          />
        </div>
        <div className="row col-12 justify-content-end">
          <button className="col-2 form-control btn-info"
                  onClick={ () => this.driver.eth_grant(this.state.address, this.state.name) }>Grant</button>
        </div>
      </div>
    )
  }
} // Granter

class Degranter extends Component {
  constructor(props) {
    super(props);
    this.driver = props.driver;
    this.address = props.address;
    this.contractOwner = props.owner;
  } // constructor

  shouldComponentUpdate(nextProps) {
    if (nextProps.owner === this.contractOwner)
      return false;

    this.contractOwner = nextProps.owner;
    return true;
  } // shouldComponentUpdate

  render() {
    if (this.driver.account() !== this.contractOwner)
      return (<div/>)
    if (this.address === this.contractOwner)
      return (<div/>)

    return (
      <button className="col-1 form-control btn-sm btn-danger"
              onClick={ () => this.driver.eth_remove(this.address) }>X</button>
    )
  }
}

class GrantedList extends Component {
  render() {
    return (
      <div className="border border-primary row p-2">
        <div className="col-12">
          <strong>With Contract Write Permission</strong>
        </div>
        <div className="row col-12">
          {
            Object.entries(this.props.grants)
              .map(([address, name]) => {
                return (
                  <Fragment key={address}>
                    <div className="col-11">{name}</div>
                    <Degranter
                      driver={this.props.driver}
                      owner={this.props.owner}
                      address={address}
                    />
                  </Fragment>
                )
              })
          }
        </div>
      </div>
    )
  } // render
} // GrantedList

class Permissions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      grants: { }
    }

    this.driver = props.driver;
  } // constructor

  componentDidMount() {
    this.driver.watchEvents(evt => this.event(evt));
  } // componentDidMount

  event(evt) {
    if (evt === this.driver.resetEvent)
      this.setState({
        grants: { },
        contractOwner: null
      });

    const eventName = evt.event;
    if (eventName === 'PermissionGranted')
        return this.granted(evt.args._addr, evt.args._name)
    if (eventName === 'PermissionRemoved')
        return this.removed(evt.args._addr)
  } // event

  granted(addr, name) {
    if (name === 'contract')
      this.setState({ contractOwner: addr });

    const grants = this.state.grants;
    grants[addr] = name;
    this.setState({
      grants: grants
    });
  } // granted

  removed(addr) {
    const grants = this.state.grants;
    delete grants[addr];
    this.setState({
      grants: grants
    });
  } // removed

  render() {
    return (
      <div className="row">
        <div className="col-6">
          <GrantedList
            grants={this.state.grants}
            driver={this.driver}
            owner={this.state.contractOwner}/>
        </div>
        <div className="col-6">
          <Granter
            driver={this.driver}
            owner={this.state.contractOwner}/>
        </div>
      </div>
    )
  } // render
} // class Permissions

export default Permissions;
