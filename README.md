# Server Side Telegram Bot For Codeforces Local Group

Please refer to the project [TeleBotForCodeforcesForLocalGroup](https://github.com/SaiKamalP/TeleBotForCodeforcesForLocalGroup) first. This project provides a server side implementation for the same.

## Setup

1. Telegram bot token and chat Id
   1. Replace your token and chat Id at the top in the telegram.js file.
2. Update user handles
   1. In databaseFiles/codeforcesHandles.json a sample template is provided, place the handles of your interest in there.
3. Running the code
   1. Requirements
      1. `nodeJs`
      2. npm package `node-telegram-bot-api`, `puppeteer`
   2. Run `node main.js`
4. Running repeatedly on server
   1. You may use various tools to do this, as an example refer to `crontab` on linux

## Customization

To select what type of contests to push notifications update `CONTEST_TYPES_TO_INCLUDE` in `main.js`

## Development Setup

We don't want to commit the databaseFiles, to make this happen automatically run 

`git update-index --assume-unchanged databaseFiles/*`

This should prevent the files from being committed.

