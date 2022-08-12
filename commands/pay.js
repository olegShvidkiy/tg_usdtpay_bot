const channelChatId = require("../config.json").chat_id;
const {getChannelInviteLink, getChatMember} = require("../utils/utils.js")
module.exports = {
    name: "pay",
    run: async (bot, message, args)=>{
        const chatId = message.chat.id;
        // getChatMember(bot, 385009577, chatId)
        const link = await getChannelInviteLink(bot,channelChatId);;
        bot.sendMessage(chatId, link)
    }
}