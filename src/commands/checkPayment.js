const channelChatId = process.env.TG_CHAT_ID;
const {getChannelInviteLink} = require("../utils/utils.js")
const Payment = require("../db/models/payment");
const Users = require("../db/models/user");
require('dotenv').config();
const getTransactionList = require("../transaction_checker");
module.exports = {
    name: "checkPayment",
    cooldown: 5000,
    run: async (bot, message, args )=>{
        const chatId = message.chat.id;
        let payment, user;
        try{ 
            user = await Users.find({tg_id: chatId}).exec();
            payment = await Payment.find({tg_id: message.chat.id}).exec()
        }catch(err){console.log(err);}

       
        if(user.length) {
            bot.sendMessage(chatId, "Вы уже зарегестрированы!");
            return;
        }
        
        if(!payment.length){
            bot.sendMessage(chatId, `Вы ещё не начинали платеж!`);
            return;
        }
        
        const tx = await getTransactionList(payment[0]);
        // const tx = transactionList.find( element =>{
        //     return element.coin === "USDT" && element.network === "TRX" && element.address === process.env.WALLETUSDT && element.amount === String(Number(`19.00${payment[0].unique_code}`));
        // });
        // const tx = true;
        console.log(tx)
        if(tx){
            try {
                const tg_username = payment[0].tg_username;
                const tg_id = payment[0].tg_id;
                const tx_id = tx;
                const date = new Date();
                const expire_date = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours()).getTime();

                const user = new Users({tg_id, tx_id, tg_username, expire_date}); 
                await user.save();
                await Payment.deleteOne({tg_id}).exec();
                const link = await getChannelInviteLink(bot,channelChatId);
                bot.sendMessage(chatId, `Платеж успешный! Ваша ссылка(действительна в течении 30-ти минут): ${link}`)
            } catch (err) {console.log(err)}
            
        }else{
            bot.sendMessage(chatId, `Платеж ещё не поступил`)
        }
        
    }
}