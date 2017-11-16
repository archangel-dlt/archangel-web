import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './bootstrap/css/bootstrap.css'
import Search from './Search'

import Guardtime from './driver/Guardtime'

const driver = new Guardtime()

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo float-left" alt="logo" />
          <h1 className="App-title">Archangel-DLT</h1>
          <p>For all your long time archive validation needs ...</p>
        </header>
        <p className="App-body row">
          <div className="col-md-2"/>
          <div className="col-md-8">
            <Search driver={driver}/>
          </div>
          <div className="col-md-2"/>
        </p>
      </div>
    );
  }
}

export default App;
