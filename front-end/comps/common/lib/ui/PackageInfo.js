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

class PackageFields extends PureComponent {
  constructor(props, fields) {
    super(props);
    this.fields = fields;

    if (this.props.initialData)
      this.fieldNames.forEach(name => this[name] = this.props.initialData[name]);
  }

  get onData() { return this.props.onData; }

  get fieldNames() { return this.fields.filter(f => !!f.field).map(f => f.field) }
  get dataReady() {
    return this.fieldNames.reduce((acc, name) => acc && !!this[name], true)
  } // get

  get data() {
    const d = {
      [key]: this[key],
      [pack]: this[pack],
    }

    this.fieldNames.forEach(name => d[name] = this[name]);

    return d;
  } // data

  update(field, value) {
    this[field] = value

    this.onData(this.dataReady ? this.data : null);
  } // update

  render() {
    return this.fields.map((field, i) => {
      if (field.title === '--')
        return (<br key={i}/>)
      return (
        <Field
          key={i}
          title={field.title}
          size={field.length}
          onValue={v => this.update(field.field, v)}
          disabled={this.props.readonly}
          initialValue={this.props.initialData ? this.props.initialData[field.field] : null}/>
      )
    });
  } // render
} // Class SipInfo

const sipFields = [
  { title: 'Supplier', field: supplier },
  { title: 'Creator', field: creator },
  { title: '--' },
  { title: 'Rights Statement', field: rights },
  { title: 'Held By', field: held }
];

const aipFields = [
  { title: 'Citation Reference', field: citation, length: 'small' },
  { title: '--' },
  ...sipFields
]

class SipInfo extends PackageFields {
  constructor(props) {
    super(props, sipFields);
    this[key] = uuid();
    this[pack] = 'sip';
  }
}

class AipInfo extends PackageFields {
  constructor(props) {
    super(props, aipFields);
    this[key] = this.props.initialData[key]
    this[pack] = 'aip';
  }
}

function PackageInfo({ initialData }) {
  if (initialData.pack === 'aip')
    return (<AipInfo initialData={initialData} readonly={true}/>)
  return (<SipInfo initialData={initialData} readonly={true}/>)
}

export { SipInfo, AipInfo, PackageInfo };
