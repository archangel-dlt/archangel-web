import unirest from 'unirest';
import sha256 from './sha256-digest';
import {DateTime} from "luxon";

class GuardtimeV2 {
  constructor(username, password, url) {
    this.username = username;
    this.password = password;
    this.guardtime_url = url;
  } // constructor

  static get name() { return "Guardtime"; }
  //const hash = await sha256(`${id}-${payload}`)

  async store(droid_payload) {
    const gt_hash = await sha256(droid_payload.sha256_hash);
    const timestamp = DateTime.utc().toFormat('yyyy-MM-dd\'T\'HH:mm:ssZZ');
    droid_payload.timestamp = timestamp;

    const gt_payload = {
      metadata: droid_payload,
      dataHash: {
        value: gt_hash,
        algorithm: 'SHA-256'
      },
      level: 0
    } // upload

    return this.gt_write_(gt_payload)
      .then(() => `${droid_payload.name} written to Guardtime`);  } // store

  async fetch(id) {
    return this.findRecords(id, 'id');
  } // fetch

  async search(phrase) {
    return this.findRecords(phrase, 'payload', 'name', 'comment')
  } // search

  //////////////////////////////////////
  async findRecords(value, ...fields) {
    const searches = fields.map(field => this.gt_search_(field, value))
    const results = await Promise.all(searches)
    const gt_ids = []
    results.forEach(r => gt_ids.push(...r.ids));
    if (!gt_ids || gt_ids.length === 0)
      return [];

    const records = await Promise.all(gt_ids.map(id => this.gt_fetch_(id)));
    return records.map(record => record.metadata)
  } // findRecord

  //////////////////////////////////////
  gt_fetch_(gt_id) {
    return this.gt_get_(`/${gt_id}`)
  } // gt_fetch_

  gt_search_(field, value) {
    return this.gt_get_(`?metadata.${field}=${value}`);
  } // gt_search_

  gt_write_(gt_payload) {
    return this.gt_post_(gt_payload);
  } // gt_write_

  gt_get_(params) {
    return this.gt_('get', params);
  } // gt_get_

  gt_post_(gt_payload) {
    return this.gt_('post', null, gt_payload);
  } // gt_post

  gt_(method, params, payload) {
    return new Promise((resolve, reject) => {
      unirest[method](`${this.guardtime_url}${params ? params : ''}`)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .auth(this.username, this.password)
        .send(payload)
        .end(resp => {
          if (!resp.error)
            return resolve(resp.body)

          reject(gtError(resp));
        });
    })
  } // gt_
} // GuardtimeV2

function gtError(resp) {
  const error = new Error(resp.error)
  error.status = resp.code;
  error.data = resp.body;
  return error;
} // gtError

export default GuardtimeV2;