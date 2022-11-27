const fs = require("fs");
const TelegramApi = require("node-telegram-bot-api");
const db = require("./src/db/db");
const startSchedule = require("./src/schedule");
const buttonHandler = require("./src/buttonHandler");
const text = require("./assets/text.json");

require("dotenv").config();
const token = process.env.TG_API;
const bot = new TelegramApi(token, { polling: true });

bot.commands = new Map();
const commands = fs.readdirSync("./src/commands").filter((file) => file.endsWith(".js"));

commands.forEach((file) => {
    const commandName = file.substr(0, file.indexOf("."));
    const command = require(`./src/commands/${commandName}`);
    bot.commands.set(commandName, command);
});

bot.setMyCommands([{ command: "/start", description: "Start message" }]);

const keyboard = require("./enums/keyboard_enum");
const admin = [385009577, 1348148604];
const lastTime = {};

const prefix = "/";

bot.on("message", async (message) => {
    try {
        if (message?.from?.is_bot || message?.chat?.type === "supergroup") return;
        if (message?.text === "/start") {
            bot.sendMessage(message?.chat?.id, text.helloMessage, keyboard.BEFORE_START);
        }
        let command;
        if (message?.text?.startsWith(prefix)) {
            const args = message.text.slice(prefix.length).trim().split(/ +/g);
            const commandName = args.shift();
            command = bot.commands.get(commandName);
            if (!command) return;
            if (command.adminCommand) {
                console.log("USED ADMIN COMMAND", message.chat);
                if (!admin.includes(message.chat.id)) return;
            }
            command.run(bot, message, args);
        }
        buttonHandler(bot, message);
    } catch (err) {
        console.log(err);
    }
});

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

startSchedule(bot);

