const Users = require("../db/models/user");
const Payment = require("../db/models/payment");
const {getChannelInviteLink} = require("../utils/utils.js");
require('dotenv').config();
const roomChatId = process.env.TG_CHAT_ROOM_ID;
const keyboard = require("../../enums/keyboard_enum")
module.exports = {
    name: "addUser",
    adminCommand: true,
    run: async (bot, message, args )=>{
        const chatId = message.chat.id;
        let payment, user;
        try{
            const tg_username = args[0];
            const link = await getChannelInviteLink(bot, roomChatId);
            user = await Users.find({tg_username: tg_username});
            if(!user.length) {
                bot.sendMessage(chatId, "Пользователя нет в базе данных!");
                return;
            }

            if(user.length){
                bot.unbanChatMember(roomChatId, user[0].tg_id, {only_if_banned: true});
                bot.sendMessage(user[0].tg_id, `Ccылка на чат: ${link}`, keyboard.SUCCESSFUL_PAYMENT);
                bot.sendMessage(chatId, `Ccылка на чат отправлена пользователю @${tg_username}!`);
                return;
            }
        }catch(err){console.log(err);}

    }
}