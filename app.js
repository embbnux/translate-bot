const builder = require('botbuilder');
const { GlipConnector } = require('botbuilder-glip');
const restify = require('restify');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const { TranlateService } = require('./translate');

dotenv.config();

const translateAPI = new TranlateService({ key: process.env.TRANSLATE_TEXT_SUBSCRIPTION_KEY });

let botsData = {};
const botsDataFile = path.join(__dirname, '.cache');
if (fs.existsSync(botsDataFile)) {
  botsData = JSON.parse(fs.readFileSync(botsDataFile, 'utf-8'));
}

const server = restify.createServer();

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

const connector = new GlipConnector({
  botLookup: (botId) => {
    const botEntry = botsData[botId];
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
const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);

bot.on('installationUpdate', (event) => {
  console.log(`New bot installed: ${event.sourceEvent.TokenData.owner_id}`);

  botsData[event.sourceEvent.TokenData.owner_id] = {
    identity: event.address.bot,
    token: event.sourceEvent.TokenData
  };
  fs.writeFileSync(botsDataFile, JSON.stringify(botsData)); // save token
});

const intents = new builder.IntentDialog({ recognizers: [recognizer] })
  .matches('Translate.Translate', async (session, args) => {
    console.log(args.entities);
    const text = args.entities.find((e) => e.type === 'Translate.Text');
    let language = args.entities.find((e) => e.type === 'Translate.TargetLanguage');
    if (!text) {
      return;
    }
    if (!language) {
      language = 'english';
    }
    const translation = await translateAPI.translate({ text: text.entity, language: language.entity });
    session.send('Translate: \'%s\'', translation);
  })
  .onDefault((session) => {
    console.log(session.message.text);
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
  });

bot.dialog('/', intents);
