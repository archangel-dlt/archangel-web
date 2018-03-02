import superagent from 'superagent';
import sha256 from './sha256-digest';

class GuardtimeV2 {
  constructor(username, password, url) {
    this.username = username;
    this.password = password;
    this.guardtime_url = url;
  } // constructor

  static get name() { return "Guardtime"; }
  //const hash = await sha256(`${id}-${payload}`)

  async store(droid_payloads, progress) {
    for (const payload of droid_payloads)
      await this.store_one(payload, progress);
  } // store

  async fetch(id) {
    return this.findRecords(id, 'sha256_hash');
  } // fetch

  async search(phrase) {
    return this.findRecords(phrase, 'payload', 'name', 'comment', 'parent_sha256_hash', 'puid')
  } // search

  //////////////////////////////////////
  async store_one(payload, progress) {
    try {
      const gt_hash = await sha256(payload.sha256_hash);

      const gt_payload = {
        metadata: payload,
        dataHash: {
          value: gt_hash,
          algorithm: 'SHA-256'
        },
        level: 0
      } // upload

      await this.gt_write_(gt_payload);
      progress.message(`${payload.name} written to Guardtime`);
    } catch(err) {
      progress.error(err);
    } // catch
  } // store_one

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
    return superagent[method](`${this.guardtime_url}${params ? params : ''}`)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .auth(this.username, this.password)
      .send(payload)
      .then(resp => resp.body)
      .catch(err => { throw err })
  } // gt_
} // GuardtimeV2

export default GuardtimeV2;