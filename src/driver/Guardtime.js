import unirest from 'unirest';

class GuardtimeBase {
  constructor(username, password, url) {
    this.guardtime_url = url;
    this.username = username;
    this.password = password;
  }

  gt_search_(id) {
    return this.gt_get_(`?metadata.id=${id}`)
  } // gt_search_

  gt_get_(params) {
    return this.gt_('get', params)
  } // gt_get_

  gt_(method, params, payload) {
    return new Promise((resolve, reject) => {
      unirest[method](`${this.guardtime_url}${params}`)
        .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        .auth(this.username, this.password)
        .send(payload)
        .end(resp => {
          if (!resp.error)
            return resolve(resp.body)

          console.log(resp.error);
          console.log(resp.code);
          console.log(resp.body);
          reject();
        });
    })
  }

  /*
      def gt_write(gt_payload)
        gt_post(gt_payload)
      end # gt_write

      def gt_post(gt_payload)
        gt(:post, nil, gt_payload.to_json)
      end

   */
}

class GuardtimeV2 extends GuardtimeBase {
  constructor(username, password) {
    super(
      username,
      password,
      'https://tryout-catena-db.guardtime.net/api/v2/signatures'
    )
  }

  store(id, payload, time) {

  } // store

  async fetch(id) {
    const results = await this.gt_search_(id);
    const gt_ids = results.ids;
    if (!gt_ids || gt_ids.length === 0)
      return [];

    const records = await Promise.all(gt_ids.map(id => this.gt_fetch_(id)));
    return records.map(record => record.metadata)
  } // fetch

  gt_fetch_(gt_id) {
    return this.gt_get_(`/${gt_id}`)
  }
}

export default GuardtimeV2