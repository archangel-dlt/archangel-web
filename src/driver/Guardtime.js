import unirest from 'unirest';
import sha256 from './sha256-digest';

class GuardtimeV2 {
  constructor(username, password, url) {
    this.username = username;
    this.password = password;
    this.guardtime_url = url;
  } // constructor

  static get name() { return "Guardtime"; }

  async store(id, payload, timestamp) {
    const hash = await sha256(`${id}-${payload}`)
    const gt_payload = {
      metadata: {
        id: id,
        payload: payload,
        timestamp: timestamp
      },
      dataHash: {
        value: hash,
        algorithm: 'SHA-256'
      },
      level: 0
    } // upload

    return this.gt_write_(gt_payload);
  } // store

  async fetch(id) {
    const results = await this.gt_search_(id);
    const gt_ids = results.ids;
    if (!gt_ids || gt_ids.length === 0)
      return [];

    const records = await Promise.all(gt_ids.map(id => this.gt_fetch_(id)));
    return records.map(record => record.metadata)
  } // fetch

  //////////////////////////////////////
  gt_fetch_(gt_id) {
    return this.gt_get_(`/${gt_id}`)
  } // gt_fetch_

  gt_search_(id) {
    return this.gt_get_(`?metadata.id=${id}`);
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