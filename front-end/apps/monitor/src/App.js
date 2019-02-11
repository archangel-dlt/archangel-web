import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './bootstrap/css/bootstrap.css';
import { ArchangelDriver, ArchangelProviderPicker } from '@archangeldlt/web-common';
import Permissions from './ui/Permissions';
import Blocknumber from './ui/Blocknumber';
import EventLog from './ui/Eventlog';

const ethereumDriver = ArchangelDriver();

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
        <ArchangelProviderPicker driver={ethereumDriver}/>
      </div>
    </header>
  );
} // Header

class Body extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="col-12 row justify-content-end">
          <Blocknumber driver={ethereumDriver}/>
        </div>

        <Permissions driver={ethereumDriver} />

        <EventLog driver={ethereumDriver} />
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
