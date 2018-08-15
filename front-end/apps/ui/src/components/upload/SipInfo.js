import React, { PureComponent, Fragment } from 'react';
import { Field } from '@archangeldlt/web-common';

const citation = 'citation';
const supplier = 'supplier';
const creator = 'creator';
const rights = 'rights';
const held = 'held';

class SipInfo extends PureComponent {
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
  } // update

  render() {
    return (
      <Fragment>
        <Field title='Citation Reference' length='small' onValue={v => this.update(citation, v)}/>
        <hr/>
        <Field title='Supplier' onValue={v => this.update(supplier, v)}/>
        <Field title='Creator' onValue={v => this.update(creator, v)}/>
        <hr/>
        <Field title='Rights statement' onValue={v => this.update(rights, v)}/>
        <Field title='Held By' onValue={v => this.update(held, v)}/>
      </Fragment>
    );
  } // render
} // Class SipInfo

export default SipInfo;