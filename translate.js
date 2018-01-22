const axios = require('axios');
const { parseString } = require('xml2js');

const languages = require('./languages');

async function xml2json(xml) {
  return new Promise((resolve, reject) => {
    parseString(xml, function (err, json) {
      if (err) {
        reject(err);
      } else {
        resolve(json);
      }
    });
  });
}

class TranlateService {
  constructor({
    key,
  }) {
    this._key = key;
  }

  async translate({ text, language }) {
    const lang = languages[language.toLowerCase()];
    if (!lang) {
      return null;
    }
    try {
      const response = await axios({
        method: 'get',
        url: `https://api.microsofttranslator.com/V2/Http.svc/Translate?to=${lang}&text=${encodeURI(text)}`,
        headers: {
          'Ocp-Apim-Subscription-Key': this._key,
        },
        responseType: 'text'
      });
      const data = await xml2json(response.data);
      return data.string && data.string._;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

exports.TranlateService = TranlateService;