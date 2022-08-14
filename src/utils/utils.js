module.exports = {
    getChannelInviteLink: async (bot, chatId) => {
        const ops = {
            member_limit: 1
        } 
        let link = await bot.createChatInviteLink(chatId, ops);
        return link.invite_link;
    },

    getChatMember: async (bot, memberId, chatId)=>{
        bot.getChatMember(  memberId, chatId).then(res=>console.log(res));
    }
} 