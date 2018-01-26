# translate-bot

A Glip translate bot with botbuilder-glip

## How to

### Prerequisites

* Node.js > 8
* Mongodb
* [RingCentral developer free account](https://developer.ringcentral.com)
* [Dialogflow account](https://dialogflow.com)
* Microsoft tanslate text API key

### Clone this project

```bash
$ git clone https://github.com/embbnux/translate-bot.git
$ cd translate-bot
$ yarn install
```

### Create .env file

```
$ touch .env
$ vim .env
```


Sample of .env file

```
GLIP_API_SERVER=https://platform.devtest.ringcentral.com
GLIP_CLIENT_ID=your_ringcentral_client_id
GLIP_CLIENT_SECRET=your_ringcentral_client_secret
GLIP_BOT_SERVER=your_bot_server_url
GLIP_BOT_VERIFICATION_TOKEN=random_chars_length_32
DIALOGFLOW_TOKEN=your_dialogflow_agent_token
TRANSLATE_TEXT_SUBSCRIPTION_KEY=your_microsoft_translate_text_subscription_key
MONGODB_URI=your_mongodb_uri, such as: mongodb://localhost:27017
MONGODB_DB=your_mongodb_db_name
```

### Start server

```
yarn start
```

## Step By Step Tutorial to show how to use `botbuilder-glip`

https://github.com/embbnux/botbuilder-glip-demos
