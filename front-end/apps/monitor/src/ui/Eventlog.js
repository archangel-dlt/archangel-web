import React, { Component, Fragment } from 'react';
import { PuidFormatter, FileSizeFormatter, PackageInfo } from '@archangeldlt/web-common';

const maxEvents = 20;

class Eventlog extends Component {
  constructor(props) {
    super(props);

    this.state = { groupedEvents: new Map() }
  } // constructor

  get driver() { return this.props.driver; }

  componentDidMount() {
    this.driver.watchEvents(evt => this.event(evt));
  } // componentDidMount

  event(evt) {
    if (evt === this.driver.resetEvent) {
      this.setState({
        groupedEvents: new Map()
      });
      return;
    }

    const groupedEvents = this.state.groupedEvents;

    if(groupedEvents.size > maxEvents)
      groupedEvents.delete(groupedEvents.keys().next().value);

    const key = this.groupKey(evt);
    const eventList = groupedEvents.get(key) || [ ]
    eventList.push(evt);
    groupedEvents.delete(key);
    groupedEvents.set(key, eventList);

    this.setState({
      groupedEvents: groupedEvents
    });
  } // event

  groupKey (evt) {
    if (!evt.args)
      return evt;
    if (evt.args._key)
      return evt.args._key;
    if (evt.args._addr)
      return evt.args._addr;
    return evt;
  } // groupKey

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
    const record = this.driver.unwrapPayload(args._payload);

    if (record.name)
      return this.formatOldRecord(record, args._addr);

    return this.formatPackage(record, args._addr);
  } // formatRegistration

  formatPackage({data, files, timestamp}, addr) {
    return (
      <Fragment>
        <PackageInfo initialData={data}/>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-6 offset-2'>Contains {files ? files.length : 'no'} file{files ? (files.length > 1 ? 's' : '') : 's' }.</div>
            <div className="col-4">Uploaded by <strong>{this.driver.addressName(addr)}</strong> at {timestamp} </div>
          </div>
        </div>
      </Fragment>
    )
  } // formatPackage

  formatOldRecord(record, addr) {
    return (
      <div className="col-12 row">
        <div className="row col-12">
          <div className="col-8"><strong>{record.name}</strong></div>
          <div className="col-2"><PuidFormatter value={record.puid}/></div>
          <div className="col-2"><FileSizeFormatter value={record.size}/></div>
        </div>
        <div className="row col-12">
          <div className="col-8">{record.sha256_hash}</div>
          <div className="col-4">Last Modified: {record.last_modified}</div>
        </div>
        <div className="row col-12">
          <div className="col-8">{record.comment}</div>
          <div className="col-4">Uploaded by <strong>{this.driver.addressName(addr)}</strong> at {record.timestamp} </div>
        </div>
        {
          record.parent_sha256_hash &&
          <div className="col-12">Parent: <i>{record.parent_sha256_hash}</i></div>
        }
      </div>
    )
  } // formatOldRecord

  formatPermissionGranted(args) {
    if (args._name === 'contract')
      this.contractOwner = args._addr;
    return (<div className="col-12">To <strong>{args._name}</strong>, {args._addr}</div>);
  } // formatPermissionGranted

  formatPermissionRemoved(args) {
    return (<div className="col-12">From <strong>{args._name}</strong>, {args._addr}</div>);
  } // formatPermissionGranted

  renderEvents(first, rest = []) {
    return (
      <Fragment key={first.transactionHash}>
        <div className="row col-12">
          <div className="col-2">Block {first.blockNumber}</div>
          <div className="col-10"><strong>{first.event}</strong></div>
        </div>
        <div className="row col-12">
          { this.formatEvent(first.event, first.args) }
        </div>
        <div className="row offset-1 col-10">
          { rest.map(e => this.renderEvents(e)) }
        </div>
      </Fragment>
    );
  } // renderEvents

  renderEventGroup(eventGroup) {
    const lastIndex = eventGroup.length-1;
    const evt = eventGroup[eventGroup.length-1];
    const otherEvts = eventGroup.slice(0, lastIndex).reverse();

    return (
      <div>
        { this.renderEvents(evt, otherEvts) }
        <hr/>
      </div>
    )
  } // renderEventGroup

  render() {
    const events = this.state.groupedEvents;

    const renderedEvents = [];

    for (const group of events.values()) {
      const renderedGroup = this.renderEventGroup(group);
      renderedEvents.unshift(renderedGroup);
    } // for ...

    return renderedEvents;
  } // render
} // class Eventlog

export default Eventlog;
