
const EndedSubs = require("../db/models/endedSubs");
require('dotenv').config();
const roomChatId = process.env.TG_CHAT_ROOM_ID;
module.exports = {
    name: "kickFromChat",
    adminCommand: true,
    run: async (bot, message, args)=>{
        const chatId = message.chat.id;
        let endedSubs;
        try{
            endedSubs = await EndedSubs.find({});
            bot.sendMessage(chatId, `Успешно! Бот Удалил всех пользователей с просроченой подпиской из чата`, {parse_mode: "Markdown"});
            endedSubs.forEach( sub => {
                bot.kickChatMember(roomChatId, user.tg_id);
            });
        }catch(err){console.log(err);}

    }
}