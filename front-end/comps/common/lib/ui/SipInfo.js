import React, { PureComponent } from 'react';
import Field from './Field';
import uuid from 'uuid/v1';

const key = 'key';
const pack = 'pack';
const citation = 'citation';
const supplier = 'supplier';
const creator = 'creator';
const rights = 'rights';
const held = 'held';

class SipInfo extends PureComponent {
  get onData() { return this.props.onData; }

  get dataReady() {
    for (const f of [supplier, creator, rights, held])
      if (!this[f])
        return false;
    return true;
  } // get

  get data() {
    return {
      [key]: uuid(),
      [pack]: 'sip',
      // [citation]: this[citation],
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
    const fields = [
      // { title: 'Citation Reference', field: citation, length: 'small' },
      // { title: '--' },
      { title: 'Supplier', field: supplier },
      { title: 'Creator', field: creator },
      { title: '--' },
      { title: 'Rights Statement', field: rights },
      { title: 'Held By', field: held }
    ];

    return fields.map((field, i) => {
      if (field.title === '--')
        return (<br key={i}/>)
      return (
        <Field
          key={i}
          title={field.title}
          length={field.length}
          onValue={v => this.update(field.field, v)}
          disabled={this.props.readonly}
          initialValue={this.props.initialData ? this.props.initialData[field.field] : null}/>
      )
    });
  } // render
} // Class SipInfo

export default SipInfo;
