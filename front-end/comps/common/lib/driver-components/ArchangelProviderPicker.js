import React from 'react';

class ArchangelProviderPicker extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      networkName: '<checking>'
    }

    this.driver.ready.then(() => this.setNetworkName(this.driver.networkName))
  } // constructor

  onProviderChange(key) {
    this.driver.onProviderChange(key)
      .then(() => this.setNetworkName(this.driver.networkName))
  } // onProviderChange

  setNetworkName(n) { this.setState({networkName: n}) }

  get driver() { return this.props.driver }

  ///////////////////////////////
  render() {
    return (
      <React.Fragment>
        <div className="row col-md-12">
          <label className="col-md-4 form-text">
            <span className="float-right">Ethereum<br/>Provider</span>
          </label>
          <select className="col-md-8 form-control"
                  onChange={event => this.onProviderChange(event.target.value)}>
            {
              this.driver.providers.map(
                p => <option key={p.name} value={p.name}>{p.name}</option>
              )
            }
          </select>
        </div>
        { (!this.driver.metaMaskAvailable && !this.driver.mistAvailable) &&
        <sup className="col-md-12"><span className="float-right">Install MetaMask plugin for
                <a target='_blank' rel="noopener noreferrer" href='https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/'>Firefox</a> and
                <a target='_blank' rel="noopener noreferrer" href='https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en'>Chrome</a></span></sup>
        }
        <sub className="col-md-12"><span className="float-right">Connected to { this.state.networkName } network</span></sub>
      </React.Fragment>
    );
  } // render
} // class ArchangelProviderPicker

export default ArchangelProviderPicker;
