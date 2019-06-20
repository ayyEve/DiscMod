const DiscMod = require('../app');
const settings = require("./settings.json");

const bot = new DiscMod.Bot({}, __dirname+"/modules");

bot.login(settings.token);
