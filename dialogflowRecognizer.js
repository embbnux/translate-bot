const apiai = require('apiai');
const uuid = require('uuid');
const { IntentRecognizer } = require('botbuilder');

class DialogflowRecognizer extends IntentRecognizer {
  constructor(token) {
    super();
    this._ai = apiai(token);
  }

  onRecognize(context, callback) {
    let intent = { score: 0.0, intent: null, entities:[] };
    if (!(context && context.message && context.message.text)) {
      callback(null, intent);
      return
    }
    let sessionId;
    try {
      sessionId = context.message.address.user.id + context.message.address.channelId;
      if (sessionId.length > 36){
        sessionId = sessionId.slice(0, 35);
      }
    } catch(err) {
      sessionId = uuid();
    }
    const request = this._ai.textRequest(
      context.message.text.toLowerCase(),
      { sessionId }
    );
    request.on('response', (res) => {
      const result = res.result;
      intent = this.formatResult(result);
      callback(null, intent);
    });
    request.on('error', (error) => {
      console.error('Error found on request to API.AI:', error);
      callback(error);
    });
    request.end();
  }

  formatResult(result) {
    const message = result.resolvedQuery;
    const defaultEntities = [
      {
        entity: result.fulfillment.speech,
        type: 'fulfillment',
        startIndex: -1,
        endIndex: -1,
        score: 1
      },
      {
        entity: result.actionIncomplete,
        type: 'actionIncomplete',
        startIndex: -1,
        endIndex: -1,
        score: 1
      }
    ];
    if (result.source === 'domains') {
      return {
        score: result.score,
        intent: result.action,
        entities: defaultEntities,
      }
    }
    if (result.source !== 'agent') {
      return { score: 0.0, intent: null, entities:[] };
    }
    for (const key in result.parameters) {
      const parameter = result.parameters[key];

      if (parameter.length > 0){
        const startIndex = message.indexOf(parameter);
        const endIndex = startIndex + parameter.length - 1;
        const entity = {
          entity: parameter,
          type: key,
          startIndex: startIndex,
          endIndex: endIndex,
          score: 1
        };
        defaultEntities.push(entity);
      }
    }
    return {
      score: result.score,
      intent: result.metadata.intentName,
      entities: defaultEntities,
    };
  }
}

exports.DialogflowRecognizer = DialogflowRecognizer;
exports.default = DialogflowRecognizer;
