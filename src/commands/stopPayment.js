const Payments = require("../db/models/payment");
const Users = require("../db/models/user");
const buttons = {
    reply_markup: JSON.stringify({
        inline_keyboard:[
            [{text: "💵 Начать оплату сначала", callback_data: "startPay"}]
        ]
    }),
    parse_mode: "Markdown"
};
module.exports = {
    name: "stopPayment",
    run: async (bot, message, args )=>{
        const chatId = message.chat.id;
        try{
            user = await Users.find({tg_id: chatId});
            if(user.length) {
                bot.sendMessage(chatId, "Вы уже зарегестрированы!");
                return;
            }
            Payments.deleteOne({ tg_id: chatId }).exec().then((res)=>{
                if(!res.deletedCount) return;
                bot.sendMessage(chatId, "Оплата успешно отменена!", buttons)
            });
        }catch(err){
            bot.sendMessage(chatId, "Ошибка!")
        }
    }
}