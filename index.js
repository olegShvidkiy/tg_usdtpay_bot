const fs = require("fs");
const TelegramApi = require("node-telegram-bot-api");
const db = require("./src/db/db");
const startSchedule = require("./src/schedule");
const text = require("./assets/text.json");
const BUTTONS = require("./enums/buttons_enum");
require('dotenv').config()
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
    {command: "/start", description: "Start message"},
])

const keyboard = require("./enums/keyboard_enum");
const admin = [385009577, 1348148604];
const lastTime = {};

const prefix = "/";
bot.on( "message", async message => {
    try{
    if(message?.from?.is_bot || message?.chat?.id === process.env.TG_CHAT_ROOM_ID) return;
    if(message?.text === "/start"){
        bot.sendMessage(message?.chat?.id, text.helloMessage, keyboard.BEFORE_START);
    }
    let command;
    if(message?.text?.startsWith(prefix)){
        const args = message.text.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift();
        command = bot.commands.get(commandName);
       
        if(!command) return;
        if(command.adminCommand) {
            console.log("USED ADMIN COMMAND", message.chat);
            if(!admin.includes(message.chat.id)) return;
        }
        command.run(bot, message, args);
    }
    
    switch(message?.text){
        case BUTTONS.START_PAY: 
            command = bot.commands.get("startPay");
            if(!command && checkCooldown(message, command.cooldown)) return;
            await command.run(bot, message, []);
        break;

        case BUTTONS.READ_BEFORE:
            bot.sendMessage(message.chat.id, text.guideText, {parse_mode: "HTML"});
        break;

        case BUTTONS.INFO:
            bot.sendMessage(message.chat.id, text.infoText);
        break;

        case BUTTONS.CANCEL_PAY:
            command = bot.commands.get("stopPayment");
            if(!command && checkCooldown(message, command.cooldown)) return;
            await command.run(bot, message, []);
        break;

        case BUTTONS.CONFIRM_PAY:
            command = bot.commands.get("checkPayment");
            if(!command) return;
            if(!checkCooldown(message, command.cooldown)) {
                bot.sendMessage(message.chat.id, `Подождите! Эту команду можно использовать раз в ${command.cooldown/1000} секунд`, {parse_mode: "HTML"});
                return
            }
            await command.run(bot, message, []);
        break;
        case BUTTONS.CHECK_PAY:
            command = bot.commands.get("checkSubscription");
            if(!command) return;
            if(!checkCooldown(message, command.cooldown)) {
                bot.sendMessage(message.chat.id, `Подождите! Эту команду можно использовать раз в ${command.cooldown/1000} секунд`, {parse_mode: "HTML"});
                return
            }
            await command.run(bot, message, []);
        break;
        case BUTTONS.HELP:
            bot.sendMessage(message.chat.id, `Возникли вопросы, сложности или столкнулись с ошибкой? Пишите на аккаунт поддержки: @help_process`);
        break;
    }
}catch(err){console.log(err)}
})


// bot.on("callback_query", async msg =>{
    
//     const command = bot.commands.get(msg.data);
    
//     if(!command) return;
//     const last = lastTime[msg.message.chat.id]
//     if(last && last >= Date.now() - command.cooldown) return;
//     lastTime[msg.message.chat.id] = Date.now();

//     await command.run(bot, msg.message, []);
// })

function checkCooldown(message, cooldown){
    const last = lastTime[message.chat.id];
    if(last && last.text === message.text && last.date >= Date.now() - cooldown ) return false;
    lastTime[message.chat.id] = {date:Date.now(), text: message.text};
    return true;
}

startSchedule(bot)

