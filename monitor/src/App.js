import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './bootstrap/css/bootstrap.css';
import ReactEthereum from './driver-components/Ethereum';

const ethereumDriver = ReactEthereum();

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
    console.log(evt);
  } // event

  render() {
    return (<strong>Wahay!</strong>)
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
