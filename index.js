const fs = require("fs");
const TelegramApi = require("node-telegram-bot-api");
const db = require("./src/db/db");
const startSchedule = require("./src/schedule");
const text = require("./text.json");
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

const keyboard = require("./keyboard_config");
const admin = [385009577, 1348148604];
const lastTime = {};

const prefix = "/";
bot.on( "message", async message => {
    if(message.from.is_bot) return;
    if(message.text === "/start"){
        bot.sendMessage(message.chat.id, text.helloMessage, keyboard.BEFORE_START);
    }
    let command;
    if(message.text.startsWith(prefix)){
        
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
    
    switch(message.text){
        case "💵 Начать оплату": 
            command = bot.commands.get("startPay");
            if(!command && checkCooldown(message, command.cooldown)) return;
            await command.run(bot, message, []);
        break;

        case "❗️ ВАЖНО! ПРОЧТИТЕ ПЕРЕД ОПЛАТОЙ ❗️":
            bot.sendMessage(message.chat.id, text.guideText, {parse_mode: "HTML"});
        break;

        case "📜 Инфо":
            bot.sendMessage(message.chat.id, text.infoText);
        break;

        case "❌ Отменить оплату":
            command = bot.commands.get("stopPayment");
            if(!command && checkCooldown(message, command.cooldown)) return;
            await command.run(bot, message, []);
        break;

        case "✅ Подтвердить платеж":
            command = bot.commands.get("checkPayment");
            if(!command) return;
            if(!checkCooldown(message, command.cooldown)) {
                bot.sendMessage(message.chat.id, `Подождите! Эту команду можно использовать раз в ${command.cooldown/1000} секунд`, {parse_mode: "HTML"});
                return
            }
            // console.log(checkCooldown(message, command.cooldown))
            await command.run(bot, message, []);
        break;
        case "✅ Проверить подписку":
            command = bot.commands.get("checkSubscription");
            if(!command) return;
            if(!checkCooldown(message, command.cooldown)) {
                bot.sendMessage(message.chat.id, `Подождите! Эту команду можно использовать раз в ${command.cooldown/1000} секунд`, {parse_mode: "HTML"});
                return
            }
            // console.log(checkCooldown(message, command.cooldown))
            await command.run(bot, message, []);
        break;
        case "📜 Помощь":
            bot.sendMessage(message.chat.id, `Возникли вопросы, сложности или столкнулись с ошибкой? Пишите на аккаунт поддержки: @help_process`);
        break;
        case "📋 Правила":
            bot.sendMessage(message.chat.id, text.rulesText);
        break;
    }

})


bot.on("callback_query", async msg =>{
    
    const command = bot.commands.get(msg.data);
    
    if(!command) return;
    const last = lastTime[msg.message.chat.id]
    if(last && last >= Date.now() - command.cooldown) return;
    lastTime[msg.message.chat.id] = Date.now();

    await command.run(bot, msg.message, []);
})

function checkCooldown(message, cooldown){
    const last = lastTime[message.chat.id];
    // console.log(last, message )
    if(last && last.text === message.text && last.date >= Date.now() - cooldown ) return false;
    lastTime[message.chat.id] = {date:Date.now(), text: message.text};
    return true;
}

// setInterval(()=>console.log("hello"), 5000  )


startSchedule(bot)

