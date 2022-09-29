const Users = require("../db/models/user");
const Payment = require("../db/models/payment");
const {getChannelInviteLink} = require("../utils/utils.js");
require('dotenv').config();
const channelChatId = process.env.TG_CHAT_ID;
const keyboard = require("../../enums/keyboard_enum")
module.exports = {
    name: "addUser",
    adminCommand: true,
    run: async (bot, message, args )=>{
        const chatId = message.chat.id;
        let payment, user;
        try{
            const tg_username = args[0];
            const days = args[1];
            user = await Users.find({tg_username: tg_username});
            
            if(!user.length) {
                bot.sendMessage(chatId, "Пользователя нет в базе данных!");
                return;
            }

            if(user.length){
                    let userExpireDate = new Date(user[0].expire_date).getTime() + days*24*60*60*1000;
                    const res = await Users.updateOne({tg_id: user[0].tg_id},{expire_date: userExpireDate}); 
                    try{
                        await Payment.deleteOne({tg_id}).exec();   
                    }catch(e){}
                        
                    bot.sendMessage(chatId, `👍 Ваша подписка продлена на ${days} дней!`, keyboard.SUCCESSFUL_PAYMENT);
                    return;
            }
            bot.sendMessage(chatId, "Пользователя нет в базе данных!");
        }catch(err){console.log(err);}

    }
}