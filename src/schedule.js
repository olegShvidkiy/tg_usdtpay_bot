const cron = require("node-cron");
const user = require("./db/models/user");
const Users = require("./db/models/user");
const Payments = require("./db/models/payment")
const keyboard = require("./../enums/keyboard_enum")
const channelChatId = process.env.TG_CHAT_ID;
function startSchedule(bot){
    const everyWeekShcedule = cron.schedule("1 12 * * 7", async ()=>{
        try{ 
            const date = new Date();
            const comparedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 15, date.getHours());
            const checkedSubscriptions = await Users.find({expire_date: {$lte: comparedDate}}).exec();
            checkedSubscriptions.forEach( user => {
                if( user.expire_date <= date) {
                    bot.banChatMember(channelChatId, user.tg_id, 0);
                    console.log( user.expire_date, date)
                }else{
                    const timeToEndInDays = Math.floor((user.expire_date - date) / (1000*60*60*24));
                    console.log(timeToEndInDays);
                    bot.sendMessage(user.tg_id, `Ваш срок подписки истекает через ${timeToEndInDays} дней! Если вы хотите продлить доступ, воспользуйтесь соответствующей кнопкой в меню или командой /startPay`).then(()=>{}, (err)=>{});
                }
            })
        }catch(err){console.log(err)}
    });

    const paymentProcessTimeSchedule = cron.schedule("*/10 * * * *", async ()=>{
        try{ 
            const date = new Date();
            const comparedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() - 30);

            const checkedPayments = await Payments.find({start_date: {$lte: comparedDate}}).exec();
            checkedPayments.forEach( payment => {

                console.log(payment.start_date < comparedDate )
                Payments.deleteOne({ tg_id: payment.tg_id }).exec().then((res)=>{
                    if(!res.deletedCount) return;
                    bot.sendMessage(payment.tg_id, "Время сессии оплаты вышло!", keyboard.BEFORE_START)
                });
            }) 
        }catch(err){console.log(err)}
    });
}


module.exports = startSchedule;