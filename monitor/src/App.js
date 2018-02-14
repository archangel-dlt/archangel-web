import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './bootstrap/css/bootstrap.css'


function Logo() {
  return (
    <div>
      <img src={logo} className="App-logo float-left" alt="logo" />
      <h1 className="App-title">Archangel-DLT</h1>
      <p>Ethereum contract monitor ...</p>
    </div>
  );
} // Logo

class Body extends Component {
  render() {
    return (<strong>Wahay!</strong>)
  }
} // class Body

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header row">
          <div className="col-md-8">
            <Logo/>
          </div>
        </header>
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
