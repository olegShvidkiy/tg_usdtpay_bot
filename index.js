const config = require("./config.json");
const fs = require("fs");
const TelegramApi = require("node-telegram-bot-api");
const getTransactions = require("./src/transaction_checker");
getTransactions("/sapi/v1/capital/deposit/hisrec")
require('dotenv').config()

const token = config.tg_api;
const bot = new TelegramApi(token, {polling: true});

bot.commands = new Map();
const commands = fs.readdirSync("./src/commands").filter(file=>file.endsWith(".js"));

commands.forEach( file => {
    const commandName = file.substr(0, file.indexOf("."));
    const command = require(`./src/commands/${commandName}`);
    bot.commands.set(commandName, command);
});

const prefix = "/";
bot.on( "message", message => {
    console.log(message.text);
    if(message.text === "/start"){
        bot.sendMessage(message.chat.id, "Добро пожаловать");
    }
    if(message.text.startsWith(prefix)){
        const args = message.text.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift();
        const command = bot.commands.get(commandName);
        if(!command) return;

        command.run(bot, message, args);
    }
})



