import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './bootstrap/css/bootstrap.css'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import DriverPicker from './components/DriverPicker';
import Search from './components/Search';
import Upload from './components/Upload';

function Logo() {
  return (
    <div>
      <img src={logo} className="App-logo float-left" alt="logo" />
      <h1 className="App-title">Archangel-DLT</h1>
      <p>For all your long term archive validation needs ...</p>
    </div>
  );
} // Logo

class Body extends Component {
  constructor(props) {
    super(props);
    this.state = { driver: null };
  } // constructor

  setDriver(driver) {
    this.setState({ driver: driver });
  } // setDriver

  render() {
    const driver = this.state.driver;

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
  } // render
} // Body

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header row">
          <div className="col-md-8">
            <Logo/>
          </div>
          <div className="col-md-4">
            <DriverPicker
              onNewDriver={ driver => this.body.setDriver(driver) }
              ref={ picker => this.picker = picker }
            />
          </div>
        </header>
        <div className="App-body row">
          <div className="col-md-2"/>
          <div className="col-md-8">
            <Body
              ref={ body => {
                this.body = body;
                body.setDriver(this.picker.currentDriver);
              } }
            />
          </div>
          <div className="col-md-2"/>
        </div>
      </div>
    );
  }
}

export default App;
