const cron = require("node-cron");
const Users = require("./db/models/user");
const Payments = require("./db/models/payment")
const EndedSubs = require("./db/models/endedSubs")

const keyboard = require("./../enums/keyboard_enum")
const channelChatId = process.env.TG_CHAT_ID;
function startSchedule(bot){
    const everyWeekSchedule = cron.schedule("1 12 * * 7", async ()=>{
    
        try{ 
            const date = new Date();
            const comparedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 15, date.getHours());
            const checkedSubscriptions = await Users.find().exec();
            console.log(checkedSubscriptions)
            checkedSubscriptions.forEach( async (user) => {
                if(user.expire_date <= date) {
                    // console.log(user)
                    bot.sendMessage(user.tg_id, `Ваш срок подписки истек! Вы можете восстановить доступ, купив подписку на месяц снова!`, keyboard.BEFORE_START);
                    const endedSub = new EndedSubs({...user}); 
                    await endedSub.save();
                    Users.deleteOne({ tg_id: user.tg_id }).exec();
                    bot.kickChatMember(channelChatId, user.tg_id);
                }else{
                    const timeToEndInDays = Math.floor((user.expire_date - date) / (1000*60*60*24));
                    console.log(timeToEndInDays);
                    bot.sendMessage(user.tg_id, `Ваш срок подписки истекает через ${timeToEndInDays} дней! Если вы хотите продлить доступ, воспользуйтесь соответствующей кнопкой в меню`, keyboard.SUCCESSFUL_PAYMENT).then(()=>{}, (err)=>{});
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
                Payments.deleteOne({ tg_id: payment.tg_id }).exec().then(async (res)=>{
                    if(!res.deletedCount) return;
                    const user = await Users.find({tg_id : payment.tg_id}).exec();
                    bot.sendMessage(payment.tg_id, "Время сессии оплаты вышло!", user.length ? keyboard.SUCCESSFUL_PAYMENT : keyboard.BEFORE_START);
                });
            }) 
        }catch(err){console.log(err)}
    });
}


module.exports = startSchedule;