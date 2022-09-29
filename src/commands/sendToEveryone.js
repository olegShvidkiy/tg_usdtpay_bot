const Users = require("../db/models/user");
require('dotenv').config();
const channelChatId = process.env.TG_CHAT_ID;
const keyboard = require("../../enums/keyboard_enum")
module.exports = {
    name: "sendToEveryone",
    adminCommand: true,
    run: async (bot, message, args)=>{
        const messageToUser = args.join(" ");
        const chatId = message.chat.id;
        console.log()
        let users;
        try{
            users = await Users.find({});
            bot.sendMessage(chatId, `Успешно! Бот отправил каждому пользователю сообщение *"${messageToUser}"*`, {parse_mode: "Markdown"});
            users.forEach( user => {
                bot.sendMessage(user.tg_id, messageToUser);
            });
        }catch(err){console.log(err);}

    }
}