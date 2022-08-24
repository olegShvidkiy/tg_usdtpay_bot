const cron = require("node-cron");
const user = require("./db/models/user");
const Users = require("./db/models/user");

function startSchedule(bot){
    console.log("RUN");
    cron.schedule("1 12 * * 7", async ()=>{
        try{ 
            const date = new Date();
            const comparedDate = new Date(date.getFullYear(), date.getMonth()+1, date.getDate() , date.getHours());
            users = await Users.find({expire_date: {$lte: comparedDate}}).exec();
            users.forEach( user => {
                if( user.expire_date <= date) {
                    //ban user
                    console.log( user.expire_date, date)
                }else{
                    console.log(user);
                    const timeToEndInDays = Math.floor((user.expire_date - date) / (1000*60*60*24));
                    console.log(timeToEndInDays);
                    bot.sendMessage(user.tg_id, `Ваш срок подписки истекает через ${timeToEndInDays} дней! Если вы хотите продлить доступ, воспользуйтесь соответствующей кнопкой в меню или командой /startPay`).then(()=>{}, (err)=>{});
                }

            })
        }catch(err){console.log(err)}
    })
}


module.exports = startSchedule;