const BUTTONS = require("../enums/buttons_enum");
const text = require("../assets/text.json");
const {checkCooldown} = require("../src/utils/utils");

async function buttonHandler(bot, message){
    switch(message?.text){
        case BUTTONS.START_PAY: 
            command = bot.commands.get("startPay");
            if(!command && checkCooldown(message, command.cooldown)) return;
            await command.run(bot, message, []);
        break;

        case BUTTONS.RENEW_SUB:
            command = bot.commands.get("startPay");
            if(!command && checkCooldown(message, command.cooldown)) return;
            await command.run(bot, message, ["RENEW"]);
        break;

        case BUTTONS.READ_BEFORE:
            bot.sendMessage(message.chat.id, text.guideText, {parse_mode: "HTML"});
        break;

        case BUTTONS.INFO:
            bot.sendMessage(message.chat.id, text.infoText);
        break;

        case BUTTONS.CANCEL_PAY:
            command = bot.commands.get("stopPayment");
            if(!command && checkCooldown(message, command.cooldown)) return;
            await command.run(bot, message, []);
        break;

        case BUTTONS.CONFIRM_PAY:
            command = bot.commands.get("checkPayment");
            if(!command) return;
            if(!checkCooldown(message, command.cooldown)) {
                bot.sendMessage(message.chat.id, `Подождите! Эту команду можно использовать раз в ${command.cooldown/1000} секунд`, {parse_mode: "HTML"});
                return
            }
            await command.run(bot, message, []);
        break;

        case BUTTONS.CHECK_PAY:
            command = bot.commands.get("checkSubscription");
            if(!command) return;
            if(!checkCooldown(message, command.cooldown)) {
                bot.sendMessage(message.chat.id, `Подождите! Эту команду можно использовать раз в ${command.cooldown/1000} секунд`, {parse_mode: "HTML"});
                return
            }
            await command.run(bot, message, []);
        break;

        case BUTTONS.HELP:
            bot.sendMessage(message.chat.id, `Возникли вопросы, сложности или столкнулись с ошибкой? Пишите на аккаунт поддержки: @help_process`);
        break;
    }
}

module.exports = buttonHandler;