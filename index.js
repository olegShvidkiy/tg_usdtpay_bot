const fs = require("fs");
const TelegramApi = require("node-telegram-bot-api");
const getTransactions = require("./src/transaction_checker");
const db = require("./src/db/db");
//getTransactions("/sapi/v1/capital/deposit/hisrec")
require('dotenv').config()
const date = new Date();
console.log(new Date(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours()).getTime());
console.log(new Date(1663254000000), Date.now())
const token = process.env.TG_API;
const bot = new TelegramApi(token, {polling: true});

bot.commands = new Map();
const commands = fs.readdirSync("./src/commands").filter(file=>file.endsWith(".js"));

commands.forEach( file => {
    const commandName = file.substr(0, file.indexOf("."));
    const command = require(`./src/commands/${commandName}`);
    bot.commands.set(commandName, command);
});

bot.setMyCommands([
    {command: "/help", description: "Помощь с оплатой"},
])

const buttons = {
    reply_markup: JSON.stringify({
        inline_keyboard:[
            [{text: "💵 Начать оплату", callback_data: "startPay"}]
        ]
    })
}

const prefix = "/";
bot.on( "message", message => {
    if(message.text === "/start"){
        bot.sendMessage(message.chat.id, "Добро пожаловать", buttons);
    }
    if(message.text.startsWith(prefix)){
        const args = message.text.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift();
        const command = bot.commands.get(commandName);
        if(!command) return;

        command.run(bot, message, args);
    }
})

bot.on( "callback_query", async msg =>{
    const command = bot.commands.get(msg.data);
    if(!command) return;
    await command.run(bot, msg.message, []);
})



