const apiai = require('apiai');
const uuid = require('uuid');
const { IntentRecognizer } = require('botbuilder');

function formatParameters(result) {
  const message = result.resolvedQuery;
  const entities = [];
  for (const key in result.parameters) {
    const parameter = result.parameters[key];
    if (parameter.length > 0){
      const startIndex = message ? message.indexOf(parameter) : -1;
      const endIndex = startIndex > -1 ? (startIndex + parameter.length - 1) : -1;
      const entity = {
        entity: parameter,
        type: key,
        startIndex: startIndex,
        endIndex: endIndex,
        score: 1
      };
      entities.push(entity);
    }
  }
  return entities;
}

function formatContexts(result) {
  if (!result.contexts) {
    return [];
  }
  const contexts = [];
  result.contexts.forEach((ctx) => {
    const context = {
      type: ctx.name,
      entities: []
    };
    for (const key in ctx.parameters) {
      context.entities.push({
        entity: ctx.parameters[key],
        type: key,
        startIndex: -1,
        endIndex: -1,
        score: 1
      });
    }
    contexts.push(context);
  });
  return contexts;
}

function formatResult(result) {
  const intent = {
    score: result.score,
    intent: result.action,
    entities: [
      {
        entity: result.fulfillment && result.fulfillment.speech,
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
    ]
  };
  if (result.source === 'domains') {
    return intent;
  }
  if (result.source !== 'agent') {
    return { score: 0.0, intent: null, entities:[] };
  }
  intent.entities = intent.entities.concat(formatParameters(result));
  intent.contexts = formatContexts(result)
  return intent;
}

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
      console.error('Get sessionId error', err);
      sessionId = uuid();
    }
    const request = this._ai.textRequest(
      context.message.text.toLowerCase(),
      { sessionId }
    );
    request.on('response', (res) => {
      const result = res.result;
      intent = formatResult(result);
      callback(null, intent);
    });
    request.on('error', (error) => {
      console.error('Error found on request to API.AI:', error);
      callback(error);
    });
    request.end();
  }
}

exports.DialogflowRecognizer = DialogflowRecognizer;
exports.default = DialogflowRecognizer;
