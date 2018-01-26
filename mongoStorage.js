const MongoClient = require('mongodb').MongoClient;

class MongoStorage {
  constructor({ url, db }) {
    this._url = url;
    this._dbName = db;
    this._client = null;
    this._connectionPromise = this._initClient();
  }

  async _initClient() {
    try {
      this._client = await MongoClient.connect(this._url);
      this._db = this._client.db(this._dbName);
    } catch (e) {
      console.error(e);
    }
    this._connectionPromise = null;
  }

  async insert(doc, id, data) {
    if (this._connectionPromise) {
      await this._connectionPromise;
    }
    try {
      await this._db.collection(doc).updateOne({ __id: id }, { $set: data }, { upsert: true });
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async find(doc, id) {
    if (this._connectionPromise) {
      await this._connectionPromise;
    }
    try {
      const data = await this._db.collection(doc).find({ __id: id }).toArray();
      return data && data[0];
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

exports.MongoStorage = MongoStorage;
exports.default = MongoStorage;
