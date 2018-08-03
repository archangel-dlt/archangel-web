import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './bootstrap/css/bootstrap.css';
import { ReactEthereum } from '@archangeldlt/web-common';
import { Puid, prettysize } from '@archangeldlt/web-common';
import Permissions from './ui/Permissions';
import Blocknumber from './ui/Blocknumber';

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
      <div className="col-8">
        <Logo/>
      </div>
      <div className="col-4">
        { ethereumDriver.render() }
      </div>
    </header>
  );
} // Header

class Body extends Component {
  constructor(props) {
    super(props);

    this.state = {
      events: [],
      groupedEvents: new Map()
    }

    this.names = {}
  } // constructor

  componentDidMount() {
    ethereumDriver.watchEvents(evt => this.event(evt));
  } // componentDidMount

  event(evt) {
    if (evt === ethereumDriver.resetEvent) {
      this.setState({
        events: [ ],
        groupedEvents: new Map()
      });
      return;
    }

    const events = this.state.events;

    if(events.unshift(evt) > maxEvents)
      events.pop();

    const groupedEvents = this.state.groupedEvents;
    const key = evt.args._key || evt;
    const eventList = groupedEvents.get(key) || [ ]
    eventList.push(evt);
    groupedEvents.set(key, eventList);

    this.setState({
      events: events,
      groupedEvents: groupedEvents
    });

    console.log(this.state.groupedEvents);


  } // event

  formatEvent(name, args) {
    switch(name) {
      case 'Registration':
      case 'Update':
        return this.formatRegistration(args);
      case 'NoWritePermission':
        return this.formatNoWrite(args);
      case 'PermissionGranted':
        return this.formatPermissionGranted(args);
      case 'PermissionRemoved':
        return this.formatPermissionRemoved(args);
      default:
        return JSON.stringify(args)
    }
  } // formatEvent

  formatNoWrite(args) {
    return (<div className="col-12">From {args._addr}</div>);
  } // formatNoWrite

  formatRegistration(args) {
    const record = JSON.parse(args._payload);
    return (
      <div className="col-12 row">
        <div className="row col-12">
          <div className="col-8"><strong>{record.name}</strong></div>
          <div className="col-2"><Puid fmt={record.puid}/></div>
          <div className="col-2">{ prettysize(record.size, true) }</div>
        </div>
        <div className="row col-12">
          <div className="col-8">{record.sha256_hash}</div>
          <div className="col-4">Last Modified: {record.last_modified}</div>
        </div>
        <div className="row col-12">
          <div className="col-8">{record.comment}</div>
          <div className="col-4">Uploaded by <strong>{this.names[args._addr]}</strong> at {record.timestamp} </div>
        </div>
        {
          record.parent_sha256_hash &&
          <div className="col-12">Parent: <i>{record.parent_sha256_hash}</i></div>
        }
      </div>
    )
  } // formatRegistration

  formatPermissionGranted(args) {
    if (args._name === 'contract')
      this.contractOwner = args._addr;

    this.names[args._addr] = args._name;

    return (<div className="col-12">To <strong>{args._name}</strong>, {args._addr}</div>);
  } // formatPermissionGranted

  formatPermissionRemoved(args) {
    return (<div className="col-12">From <strong>{args._name}</strong>, {args._addr}</div>);
  } // formatPermissionGranted

  formatEvents() {
    const events = this.state.events;

    return events.map(evt => {
      return (
        <div key={evt.transactionHash}>
          <div className="row">
            <div className="col-2">Block <a href={`https://rinkeby.etherscan.io/txs?block=${evt.blockNumber}`}>{evt.blockNumber}</a></div>
            <div className="col-10"><strong>{evt.event}</strong></div>
          </div>
          <div className="row">
            { this.formatEvent(evt.event, evt.args) }
          </div>
          <hr/>
        </div>
      );
    });
  } // events

  render() {
    return (
      <React.Fragment>
        <div className="col-12 row justify-content-end">
          <Blocknumber driver={ethereumDriver}/>
        </div>

        <Permissions/>

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
          <div className="col-1"/>
          <div className="col-10">
            <Body/>
          </div>
          <div className="col-1"/>
        </div>
      </div>
    );
  }
}

export default App;
