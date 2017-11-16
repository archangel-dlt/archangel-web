import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './bootstrap/css/bootstrap.css'
import Search from './Search'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo float-left" alt="logo" />
          <h1 className="App-title">Archangel-DLT</h1>
          <p>For all your long time archive validation needs ...</p>
        </header>
        <p className="App-body">
          <Search/>
        </p>
      </div>
    );
  }
}

export default App;
