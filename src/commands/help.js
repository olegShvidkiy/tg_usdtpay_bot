module.exports = {
    name: "help",
    run: async (bot, message, args )=>{
        const chatId = message.chat.id;
        bot.sendMessage(chatId, "HELP TEXT");
    }
}