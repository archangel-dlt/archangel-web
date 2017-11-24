import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './bootstrap/css/bootstrap.css'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import Search from './components/Search';
import Upload from './components/Upload';

import GuardtimeV2 from './driver/Guardtime';

const driver = new GuardtimeV2('username', 'password');

class Body extends Component {
  render() {
    return (
      <Tabs>
        <TabList>
          <Tab>Search</Tab>
          <Tab>Upload</Tab>
        </TabList>
        <TabPanel>
          <Search driver={driver}/>
        </TabPanel>
        <TabPanel>
          <Upload driver={driver}/>
        </TabPanel>
      </Tabs>
    )
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo float-left" alt="logo" />
          <h1 className="App-title">Archangel-DLT</h1>
          <p>For all your long time archive validation needs ...</p>
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
