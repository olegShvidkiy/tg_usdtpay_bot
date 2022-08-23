const Users = require("../db/models/user");
const Payment = require("../db/models/payment");
const {getChannelInviteLink} = require("../utils/utils.js");
require('dotenv').config();
const channelChatId = process.env.TG_CHAT_ID;
const buttons = {
    reply_markup: JSON.stringify({
        keyboard:[
            ["💵 Начать оплату", "📜 Инфо"],
            ["❗️ ВАЖНО! ПРОЧТИТЕ ПЕРЕД ОПЛАТОЙ ❗️"]
        ],
        resize_keyboard: true
    }),
    parse_mode: "Markdown"
};
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
            //console.log(link);
            bot.sendMessage(chatId, `Успешно! Бот отправил пользователю ссылку-приглашение в личные сообщения`);
            bot.sendMessage(tg_id, `Платеж успешный! Ваша ссылка(действительна в течении 30-ти минут): ${link}`, buttons);
        }catch(err){console.log(err);}

    }
}