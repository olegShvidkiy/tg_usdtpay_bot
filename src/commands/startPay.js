const {generateKey} = require("../utils/utils.js")
const Payment = require("../db/models/payment");
const Users = require("../db/models/user");
require('dotenv').config()
 const buttons = {
            reply_markup: JSON.stringify({
                inline_keyboard:[
                    [{text: "✅ Подтвердить платеж", callback_data: "checkPayment"}, {text: "❌ Отменить оплату", callback_data: "stopPayment"}]
                ]
            }),
            parse_mode: "Markdown"
        };
module.exports = {
    name: "startPay",
    run: async (bot, message, args )=>{
        const chatId = message.chat.id;

        let payment;
        let user;
        try {
            payment = await Payment.find({tg_id: message.chat.id}).exec();
            user = await Users.find({tg_id: chatId});
        } catch (err) {console.log(err)} 

        if(payment.length){
            bot.sendMessage(chatId, "Вы уже начали оплату!");
            return;
        }

        if(user.length){
            bot.sendMessage(chatId, "Вы уже зарегестрированы!");
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
       
        const reply = `Адрес: *${process.env.WALLETUSDT}*  TRC20\nСума: *${"19.80"+key}*\nПосле оплаты, нажмите на кнопку *'Подтвердить платеж'*`;
       
        const pushToDb = async ()=>{
            const tg_id = message.chat.id;
            const tg_username = message.chat.username;
            const start_date = message.date*1000;
            
            const payment = new Payment({tg_username, tg_id, start_date, unique_code: key});
            await payment.save();
        };

        if(!payment.length) {
            pushToDb()
            bot.sendMessage(chatId, reply, buttons)
        }else{
            bot.sendMessage(chatId, "Вы уже начали оплату!");
        }
    }
}