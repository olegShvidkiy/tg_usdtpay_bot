const fs = require("fs");
const TelegramApi = require("node-telegram-bot-api");
const db = require("./src/db/db");
require('dotenv').config()
const token = process.env.TG_API;
const bot = new TelegramApi(token, {polling: true});

bot.commands = new Map();
const commands = fs.readdirSync("./src/commands").filter(file=>file.endsWith(".js"));

commands.forEach( file => {
    const commandName = file.substr(0, file.indexOf("."));
    const command = require(`./src/commands/${commandName}`);
    bot.commands.set(commandName, command);
});

bot.setMyCommands([
    {command: "/start", description: "Start message"},
])

const buttons = {
    reply_markup: JSON.stringify({
        keyboard:[
            ["💵 Начать оплату", "📜 Инфо"],
            ["❗️ ВАЖНО! ПРОЧТИТЕ ПЕРЕД ОПЛАТОЙ ❗️"]
        ],
        resize_keyboard: true,
    }),
    parse_mode: "Markdown"
}

const helloMessage = `👋🏻  Вас приветствует команда [001k.trading](https://www.instagram.com/001k.trading/?igshid=YmMyMTA2M2Y%3D)\n\n📌 С помощью данного бота вы можете приобрести месячную подписку на [001k.process](https://www.instagram.com/001k.trading/?igshid=YmMyMTA2M2Y%3D). Цена месячной подписки составляет 19$ + комиссия сети TRC-20.\nПеред оплатой обязательно прочитайте инструкцию в меню кнопок ниже👇🏻.`
const guideText =  `1️⃣ После начала оплаты вы получите реквизиты - адрес кошелька <b>USDT</b>(cеть <b>TRC-20</b>) и точную <b>сумму</b> которую нужно перевести, для того чтобы платеж был верифицирован\n\n2️⃣ <b>ВАЖНО! НЕ ОКРУГЛЯЙТЕ СУММУ!</b> Отправьте точно ту, которая будет указана(и не забудьте о комиссии). Например, стоимость подписки - <b>19$</b> + коммисия(если отправлять с binance 0.8$) + уникальная сума для верификации(она будет учтена в сумме, когда вы начнете оплату), например 0.001234 = <b>19.801234</b>(сумма которую вы должны ввести при отправке)\n\n3️⃣ Как только платеж будет произведен, можете вернутся в чат с ботом и нажать на кнопку <b>"Подтвердить платеж"</b>\n\n4️⃣ После проверки, вы получаете одноразовую уникальную ссылку-приглашение для доступа в наш канал.\n\nЕсли у вас возникли трудности с оплатой, можете обратиться в поддержку - @help_process`

const infoText = `⁉️Что такое 001k.process:\n\n\t • ежедневные брифинги на рынке крипты;\n\t • брифинги на фондовом рынке;\n\t • актуальные торговые ситуации в течении дня;\n\t • появление активности на монете:\n\t • появление крупного игрока в стакане;\n\t • ответы на вопросы:\n\t • запуск нескольких полезных ботов, которыми пользуется наша команда;\n\t • чат с участниками группы:`;
const lastTime = {};
//`1️⃣ После начала оплаты вы получите реквизиты - адрес кошелька *USDT*(cеть *TRC20*) и точную *сумму* которую нужно перевести, для того чтобы платеж был верифицирован\n\n2️⃣ *ВАЖНО! НЕ ОКРУГЛЯЙТЕ СУММУ!* Вводите точно ту, которая будет указана. Например, стоимость подписки - *19$* + коммисия(если отправлять с binance 0.8$) + уникальная сума для верификации, например 0.001234 = 19.801234(сумма которую вы должны ввести при отправке)\n\n3️⃣ Как только платеж будет произведен, можете вернутся в чат с ботом и нажать на кнопку "Подтвердить платеж\n\n4️⃣ После проверки, вы получаете одноразовую уникальную ссылку-приглашение для доступа в наш канал.\n\nЕсли у вас возникли трудности с оплатой, можете обратиться в поддержку - @help_process`

const prefix = "/";
bot.on( "message", async message => {
    if(message.text === "/start"){
        bot.sendMessage(message.chat.id, helloMessage, buttons);
    }
    let command;
    if(message.text.startsWith(prefix)){
        const args = message.text.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift();
        command = bot.commands.get(commandName);
        if(!command) return;

        command.run(bot, message, args);
    }

    switch(message.text){
        case "💵 Начать оплату": 
            command = bot.commands.get("startPay");
            if(!command && checkCooldown(message, command.cooldown)) return;
            await command.run(bot, message, []);
        break;

        case "❗️ ВАЖНО! ПРОЧТИТЕ ПЕРЕД ОПЛАТОЙ ❗️":
            bot.sendMessage(message.chat.id, guideText, {parse_mode: "HTML"});
        break;

        case "📜 Инфо":
            bot.sendMessage(message.chat.id, infoText);
        break;

        case "❌ Отменить оплату":
            command = bot.commands.get("stopPayment");
            if(!command && checkCooldown(message, command.cooldown)) return;
            await command.run(bot, message, []);
        break;

        case "✅ Подтвердить платеж":
            command = bot.commands.get("checkPayment");
            if(!command) return;
            if(!checkCooldown(message, command.cooldown)) return
            // console.log(checkCooldown(message, command.cooldown))
            await command.run(bot, message, []);
        break;        
    }

})

function checkCooldown(message, cooldown){
    const last = lastTime[message.chat.id]
    if(last && last >= Date.now() - cooldown) return false;
    lastTime[message.chat.id] = Date.now();
    return true;
}

bot.on("callback_query", async msg =>{
    
    const command = bot.commands.get(msg.data);
    
    if(!command) return;
    const last = lastTime[msg.message.chat.id]
    if(last && last >= Date.now() - command.cooldown) return;
    lastTime[msg.message.chat.id] = Date.now();

    await command.run(bot, msg.message, []);
})




