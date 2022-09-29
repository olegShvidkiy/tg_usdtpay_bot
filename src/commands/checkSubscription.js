const channelChatId = process.env.TG_CHAT_ID;
const Users = require("../db/models/user");
require('dotenv').config();

const keyboard = require("../../enums/keyboard_enum");

module.exports = {
    name: "checkSubscription",
    cooldown: 5000,
    run: async (bot, message, args )=>{
        const chatId = message.chat.id;
        let user;
        try{ 
            user = await Users.find({tg_id: chatId}).exec();
        }catch(err){console.log(err);}

       
        if(!user.length) {
            bot.sendMessage(chatId, "Вас нет в базе данных!", keyboard.BEFORE_START);
            return;
        }
        const expire_date = new Date(user[0].expire_date);
        const expire_date_text = `${expire_date.getDate()}.${expire_date.getMonth()+1}.${expire_date.getFullYear()}`
        console.log(expire_date.getFullYear(), expire_date.getMonth(), expire_date.getDate())
        bot.sendMessage(chatId, `Подписка найдена ✅ Действительна до *${expire_date_text}* ⏳`, keyboard.SUCCESSFUL_PAYMENT);

    }
}