const channelChatId = process.env.TG_CHAT_ID;
const roomChatId = process.env.TG_CHAT_ROOM_ID;
const {getChannelInviteLink} = require("../utils/utils.js")
const Payment = require("../db/models/payment");
const Users = require("../db/models/user");
require('dotenv').config();
const getTransactionList = require("../transaction_checker");
const text = require("../../assets/text.json")
const keyboard = require("../../enums/keyboard_enum");

module.exports = {
    name: "checkPayment",
    cooldown: 30000,
    run: async (bot, message, args )=>{
        const chatId = message.chat.id;
        let payment, user;
        try{ 
            user = await Users.find({tg_id: chatId}).exec();
            payment = await Payment.find({tg_id: message.chat.id}).exec()
        }catch(err){console.log(err);}

       
        // if(user.length) {
        //     bot.sendMessage(chatId, "Вы уже зарегестрированы!", keyboard.SUCCESSFUL_PAYMENT);
        //     return;
        // }
        
        if(!payment.length){
            bot.sendMessage(chatId, `Вы ещё не начинали платеж!`, keyboard.BEFORE_START);
            return;
        }

        const tx = await getTransactionList(payment[0]);

        if(tx){
            try {
                const tg_username = payment[0].tg_username;
                const tg_id = payment[0].tg_id;
                const tx_id = tx;
                const date = new Date();
                const expire_date = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours()).getTime();
                
                //если юзер уже есть, то продлеваем подписку
                if(user.length){
                    let userExpireDate = new Date(user[0].expire_date).getTime() + 30*24*60*60*1000;
                    const res = await Users.updateOne({tg_id: user[0].tg_id},{expire_date: userExpireDate}); 
                    await Payment.deleteOne({tg_id}).exec();    
                    bot.sendMessage(process.env.TG_NOTIFICATION_CHAT_ID, `Пользователь ${tg_username ? `@${tg_username}` : `c id: ${tg_id}`} успешно ПРОДЛИЛ подписку на месяц! Hash транзакции: ${tx_id}`);
                    bot.sendMessage(chatId, `👍Платеж успешный!\n Подписка продлена на 30 дней!`, keyboard.SUCCESSFUL_PAYMENT);
                    return;
                }

                bot.unbanChatMember(channelChatId, tg_id, {only_if_banned: true}); //если покупает повторно, то надо разбанить, чтоб мог перейти по ссылке 
                bot.unbanChatMember(roomChatId, tg_id, {only_if_banned: true});
                bot.sendMessage(process.env.TG_NOTIFICATION_CHAT_ID, `Пользователь @${tg_username} успешно оплатил подписку! Hash транзакции: ${tx_id}`);

                const newUser = new Users({tg_id, tx_id, tg_username, expire_date}); 
                await newUser.save();
                await Payment.deleteOne({tg_id}).exec();

                const link = await getChannelInviteLink(bot,channelChatId);
                const chat_link = await getChannelInviteLink(bot, process.env.TG_CHAT_ROOM_ID);
                bot.sendMessage(chatId, `👍Платеж успешный!\nТеперь вы можете перейти в наш канал и чат( ссылки действительны в течении 30ти минут ):\n[Ccылка на канал](${link})\n[Ссылка на чат](${chat_link})`, keyboard.SUCCESSFUL_PAYMENT);
                bot.sendMessage(chatId, text.rulesText);
                
            } catch (err) {console.log(err)}
        }else{
            bot.sendMessage(chatId, `Платеж ещё не поступил! Попробуйте проверить ещё раз через 30 секунд. Проверьте, правильную ли вы ввели сумму! Поддержка: @help_process`)
        }
    }
}