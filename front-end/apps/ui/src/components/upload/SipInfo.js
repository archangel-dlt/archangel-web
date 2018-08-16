import React, { PureComponent, Fragment } from 'react';
import { Field } from '@archangeldlt/web-common';

const citation = 'citation';
const supplier = 'supplier';
const creator = 'creator';
const rights = 'rights';
const held = 'held';

class SipInfo extends PureComponent {
  get onData() { return this.props.onData; }

  get dataReady() {
    for (const f of [citation, supplier, creator, rights, held])
      if (!this[f])
        return false;
    return true;
  } // get

  get data() {
    return {
      [citation]: this[citation],
      [supplier]: this[supplier],
      [creator]: this[creator],
      [rights]: this[rights],
      [held]: this[held]
    };
  } // data

  update(field, value) {
    this[field] = value

    this.onData(this.dataReady ? this.data : null);
  } // update

  render() {
    return (
      <Fragment>
        <Field title='Citation Reference' length='small' onValue={v => this.update(citation, v)} disabled={this.props.readonly}/>
        <hr/>
        <Field title='Supplier' onValue={v => this.update(supplier, v)} disabled={this.props.readonly}/>
        <Field title='Creator' onValue={v => this.update(creator, v)} disabled={this.props.readonly}/>
        <hr/>
        <Field title='Rights statement' onValue={v => this.update(rights, v)} disabled={this.props.readonly}/>
        <Field title='Held By' onValue={v => this.update(held, v)} disabled={this.props.readonly}/>
      </Fragment>
    );
  } // render
} // Class SipInfo

export default SipInfo;