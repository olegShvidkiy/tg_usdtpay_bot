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
            user = await Users.find({tg_username: tg_username});
            payment = await Payment.find({tg_username: tg_username}).exec()
            
            if(user.length) {
                bot.sendMessage(chatId, "Такой пользователь уже есть в базе данных!");
                return;
            }

            if(!payment.length){
                bot.sendMessage(chatId, "Пользователь должен начать регистрацию!");
                return;
            }

            const tg_id = payment[0].tg_id;
            const tx_id = args[1];
            const date = new Date(); 
            const expire_date = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours()).getTime();
            console.log(tg_id, tg_username, args)
            const newUser = new Users({tg_id, tx_id, tg_username, expire_date}); 
            await newUser.save();
            await Payment.deleteOne({tg_id}).exec();
            const link = await getChannelInviteLink(bot, channelChatId);
            const chat_link = await getChannelInviteLink(bot, process.env.TG_CHAT_ROOM_ID);
            //console.log(link);
            bot.sendMessage(chatId, `Успешно! Бот отправил пользователю ссылку-приглашение в личные сообщения`);
            bot.sendMessage(tg_id, `👍Платеж успешный!\nТеперь вы можете перейти в наш канал и чат( ссылки действительны в течении 30ти минут ):\n[Ccылка на канал](${link})\n[Ссылка на чат](${chat_link})`, keyboard.SUCCESSFUL_PAYMENT);
        }catch(err){console.log(err);}

    }
}