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

const buttons = {
    reply_markup: JSON.stringify({
        keyboard:[
            ["💵 Начать оплату", "📜 Инфо"],
            ["❗️ ВАЖНО! ПРОЧТИТЕ ПЕРЕД ОПЛАТОЙ ❗️"]
        ],
        resize_keyboard: true,
    }),
    parse_mode: "Markdown"
}
const admin = [385009577];
const lastTime = {};

const prefix = "/";
bot.on( "message", async message => {
    if(message.from.is_bot) return;
    if(message.text === "/start"){
        bot.sendMessage(message.chat.id, text.helloMessage, buttons);
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
            if(!checkCooldown(message, command.cooldown)) return
            // console.log(checkCooldown(message, command.cooldown))
            await command.run(bot, message, []);
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
    const last = lastTime[message.chat.id]
    if(last && last >= Date.now() - cooldown) return false;
    lastTime[message.chat.id] = Date.now();
    return true;
}

function checkExpiredSubscribes(){

}
// setInterval(()=>console.log("hello"), 5000  )


startSchedule(bot);