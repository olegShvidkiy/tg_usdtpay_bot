const fs = require("fs");
const TelegramApi = require("node-telegram-bot-api");
const db = require("./src/db/db");
const startSchedule = require("./src/schedule");
const buttonHandler = require("./src/buttonHandler");
const text = require("./assets/text.json");

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
        buttonHandler(bot, message);
    }catch(err){console.log(err)}
})

// bot.getChat(-1001424302415)
// bot.on("channel_post", (msg)=>{ console.log(msg)})

// bot.on("callback_query", async msg =>{
    
//     const command = bot.commands.get(msg.data);
    
//     if(!command) return;
//     const last = lastTime[msg.message.chat.id]
//     if(last && last >= Date.now() - command.cooldown) return;
//     lastTime[msg.message.chat.id] = Date.now();

//     await command.run(bot, msg.message, []);
// })


startSchedule(bot)

// const { Api, TelegramClient } = require('telegram')
// const { StringSession } = require('telegram/sessions')
// const input = require('input') // npm i input

// const apiId = 8378465
// const apiHash = 'b8368d4f9cfb9e6189be3b8c80c6635d'
// const stringSession = new StringSession(process.env.STRING_SESSION); // fill this later with the value from session.save()
// const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });

// (async () => {
//     await client.start();
//     const result = await client.invoke(
//         new Api.channels.GetMessages({
//           channel: "BinanceFunding",
//           id: [1000],
//         })
//       );
//       const array = result.messages[0].message.split("\n")
//       const index = array.indexOf('Shorts pay Longs if negative:');
//       const newArray = [];
//       for(let i = index - 7; i < index + 8; i ++){
//         newArray.push(array[i]);
//       };
//       newArray.unshift(array[1]);
//       newArray.unshift(array[0]);
//       console.log(newArray.join("\n"))
//       const message = newArray.join("\n");
//       client.sendMessage('me', { message: message });
//     // client.addEventHandler((update)=>{if(update?.message?.post) console.log(update?.message)})
// })()
