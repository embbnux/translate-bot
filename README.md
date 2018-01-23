# translate-bot

A Glip translate bot with botbuilder-glip

## Step By Step Tutorial

https://github.com/embbnux/botbuilder-glip-demos

## How to 

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
LUIS_MODEL_URL=your_luis_model_url
TRANSLATE_TEXT_SUBSCRIPTION_KEY=your_microsoft_translate_text_subscription_key
```

### Start server

```
yarn start
```
