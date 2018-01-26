const builder = require('botbuilder');
const { GlipConnector } = require('botbuilder-glip');
const restify = require('restify');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const { TranlateService } = require('./translate');
const { DialogflowRecognizer } = require('./dialogflowRecognizer');
const { MongoStorage } = require('./mongoStorage');

dotenv.config();

const storage = new MongoStorage({ url: process.env.MONGODB_URI, db: process.env.MONGODB_DB });

const translateAPI = new TranlateService({ key: process.env.TRANSLATE_TEXT_SUBSCRIPTION_KEY });

const server = restify.createServer();

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

const connector = new GlipConnector({
  botLookup: async (botId) => {
    const botEntry = await storage.find('bots', botId)
    return botEntry;
  },
  verificationToken: process.env.GLIP_BOT_VERIFICATION_TOKEN,
  clientId: process.env.GLIP_CLIENT_ID,
  clientSecret: process.env.GLIP_CLIENT_SECRET,
  server: process.env.GLIP_API_SERVER,
  redirectUrl: `${process.env.GLIP_BOT_SERVER}/oauth`,
  webhookUrl: `${process.env.GLIP_BOT_SERVER}/webhook`
});

server.get('/oauth', connector.listenOAuth());
server.post('/webhook', connector.listen());

server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('%s listening to %s', server.name, server.url);
});

const bot = new builder.UniversalBot(connector);
const recognizer = new DialogflowRecognizer(process.env.DIALOGFLOW_TOKEN);

bot.on('installationUpdate', (event) => {
  const botId = event.sourceEvent.TokenData.owner_id;
  console.log(`New bot installed: ${botId}`);

  const botData = {
    identity: event.address.bot,
    token: event.sourceEvent.TokenData
  };
  storage.insert('bots', botId, botData);
});

const intents = new builder.IntentDialog({ recognizers: [recognizer] })
  .matches('translate.text', async (session, args) => {
    console.log('Receive message: ', session.message.text);
    console.log('Entities: ', args.entities);
    const text = builder.EntityRecognizer.findEntity(args.entities, 'text');
    let language = builder.EntityRecognizer.findEntity(args.entities, 'lang-to');
    const fulfillment = builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
    if (!text || !language) {
      if (fulfillment && fulfillment.entity.length > 0) {
        session.send(fulfillment.entity);
      }
      return;
    }
    const translation = await translateAPI.translate({ text: text.entity, language: language.entity });
    const reply = `${text.entity} in ${language.entity}: \n > ${translation}`;
    session.send(reply);
  })
  .onDefault((session , args) => {
    console.log('Receive message: ', session.message.text);
    console.log('Intent: ', args.intent);
    console.log('Entities: ', args.entities);
    const fulfillment = builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
    if (fulfillment && fulfillment.entity.length > 0) {
      session.send(fulfillment.entity);
      return;
    }
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
  });

bot.dialog('/', intents);
