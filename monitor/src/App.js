import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './bootstrap/css/bootstrap.css';
import ReactEthereum from './driver-components/Ethereum';
import prettysize from "./lib/prettysize";
import Puid from "./lib/Puid";

const ethereumDriver = ReactEthereum();
const maxEvents = 2000;

function Logo() {
  return (
    <div>
      <img src={logo} className="App-logo float-left" alt="logo" />
      <h1 className="App-title">Archangel-DLT</h1>
      <p>Ethereum contract monitor ...</p>
    </div>
  );
} // Logo

function Header() {
  return (
    <header className="App-header row">
      <div className="col-md-8">
        <Logo/>
      </div>
      <div className="col-md-4">
        { ethereumDriver.render() }
      </div>
    </header>
  );
} // Header

class Body extends Component {
  constructor(props) {
    super(props);

    this.state = {
      events: []
    }

    ethereumDriver.watchEvents((evt) => this.event(evt));
  } // constructor

  event(evt) {
    const events = this.state.events;

    if(events.unshift(evt) > maxEvents)
      events.pop();

    if (evt === ethereumDriver.resetEvent)
      events.length = 0;

    this.setState({
      events: events
    })
  } // event

  formatEvent(name, args) {
    switch(name) {
      case 'Registration':
        return this.formatRegistration(args);
      case 'NoWritePermission':
        return this.formatNoWrite(args);
      default:
        return args.toString()
    }
  } // formatEvent

  formatNoWrite(args) {
    return (<div className="col-md-12">From {args._addr}</div>);
  } // formatNoWrite

  formatRegistration(args) {
    const record = JSON.parse(args._payload);
    return (
      <div className="col-md-12 row">
        <div className="row col-md-12">
          <div className="col-md-8"><strong>{record.name}</strong></div>
          <div className="col-md-2"><Puid fmt={record.puid}/></div>
          <div className="col-md-2">{ prettysize(record.size, true) }</div>
        </div>
        <div className="row col-md-12">
          <div className="col-md-8">{record.sha256_hash}</div>
          <div className="col-md-4">Last Modified: {record.last_modified}</div>
        </div>
        <div className="row col-md-12">
          <div className="col-md-8">{record.comment}</div>
          <div className="col-md-4">Uploaded: {record.timestamp}</div>
        </div>
        {
          record.parent_sha256_hash &&
          <div className="col-md-12">Parent: <i>{record.parent_sha256_hash}</i></div>
        }
      </div>
    )
  } // formatRegistration

  formatEvents() {
    const events = this.state.events;
    return events.map(evt => {
      return (
        <div key={evt.transactionHash}>
          <div className="row">
            <div className="col-md-2">Block <a href={`https://rinkeby.etherscan.io/txs?block=${evt.blockNumber}`}>{evt.blockNumber}</a></div>
            <div className="col-md-2"><strong>{evt.event}</strong></div>
            <div className="col-md-5"></div>
            <div className="col-md-3">
              <span className="float-right">
                [<a href={`https://rinkeby.etherscan.io/tx/${evt.transactionHash}`}>Tx</a>]
              </span>
            </div>
          </div>
          <div className="row">
            { this.formatEvent(evt.event, evt.args) }
          </div>
          <hr/>
        </div>
      );
    });
  } // events

  unlocker() {
    if (ethereumDriver.account() !== '0x71842f946b98800fe6feb49f0ae4e253259031c9')
      return

    return (
      <div className="col-md-12 row">
        <input name="address"
               className="form-control col-md-8"
               hint="Address to unlock"
               type="text"
               onChange={ e => this.setState({address: e.target.value}) }
        />
        <button className="col-md-4 form-control"
          onClick={ e => ethereumDriver.eth_grant(this.state.address) }>Grant</button>
        <hr/>
      </div>
    )
  }

  render() {
    return (
      <React.Fragment>
        { this.unlocker() }
        { this.formatEvents() }
      </React.Fragment>
    )
  }
} // class Body

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header/>
        <div className="App-body row">
          <div className="col-md-2"/>
          <div className="col-md-8">
            <Body/>
          </div>
          <div className="col-md-2"/>
        </div>
      </div>
    );
  }
}

export default App;
