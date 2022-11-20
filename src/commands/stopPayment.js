const Payments = require("../db/models/payment");
const Users = require("../db/models/user");
const keyboard = require("../../enums/keyboard_enum");
module.exports = {
    name: "stopPayment",
    cooldown: 5000,
    run: async (bot, message, args) => {
        const chatId = message.chat.id;
        try {
            user = await Users.find({ tg_id: chatId });
            if (user.length) {
                bot.sendMessage(chatId, "Вы уже зарегестрированы!");

                return;
            }
            Payments.deleteOne({ tg_id: chatId })
                .exec()
                .then((res) => {
                    if (!res.deletedCount) return;
                    bot.sendMessage(chatId, "Оплата успешно отменена!", keyboard.BEFORE_START);
                });
        } catch (err) {
            bot.sendMessage(chatId, "Ошибка!");
        }
    },
};
