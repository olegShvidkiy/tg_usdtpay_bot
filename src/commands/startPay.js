const {generateKey} = require("../utils/utils.js")
const Payment = require("../db/models/payment");
const Users = require("../db/models/user");
require('dotenv').config()
const keyboard = require("../../keyboard_config")
// {
//             reply_markup: JSON.stringify({
//                 keyboard:[
//                     ["✅ Подтвердить платеж", "❌ Отменить оплату"],
//                     ["📜 Инфо"],
//                     ["❗️ ВАЖНО! ПРОЧТИТЕ ПЕРЕД ОПЛАТОЙ ❗️"]
//                 ],
//                 resize_keyboard: true
//             }),
//             parse_mode: "Markdown"
//         };

module.exports = {
    name: "startPay",
    cooldown: 2000,
    run: async (bot, message, args )=>{
        const chatId = message.chat.id;

        let payment;
        let user;
        try {
            payment = await Payment.find({tg_id: message.chat.id}).exec();
            user = await Users.find({tg_id: chatId});
        } catch (err) {console.log(err)} 

        if(payment.length){
            bot.sendMessage(chatId, "Вы уже начали оплату!", keyboard.AFTER_START);
            return;
        }

        if(user.length){
            bot.sendMessage(chatId, "Вы уже зарегестрированы!", keyboard.SUCCESSFUL_PAYMENT);
            return;
        }

        let samePayment;
        let key;
        do{ 
            key = generateKey();
            try {
                samePayment = await Payment.find({unique_code: key}).exec()
            } catch (err) {console.log(err)} 
        }while(samePayment.length)
       
        const reply = `🔖Адрес: *${process.env.WALLETUSDT}*  TRC-20\n\n💰Сумма: *${"19.00"+key} + комиссия сети*\n(на наш счет должно прийти ${"19.00"+key} чтобы платеж прошел)\n\n✅После оплаты, нажмите на кнопку *'Подтвердить платеж'*`;
       
        const pushToDb = async ()=>{
            const tg_id = message.chat.id;
            const tg_username = message.chat.username;
            const start_date = Date.now();
            
            const payment = new Payment({tg_username, tg_id, start_date, unique_code: key});
            await payment.save();
        };

        
        pushToDb()
        bot.sendMessage(chatId, reply, {parse_mode: "Markdown"})
        bot.sendMessage(chatId, `*${process.env.WALLETUSDT}*`, keyboard.AFTER_START)
        
    }
}