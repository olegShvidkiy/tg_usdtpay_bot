module.exports = {
    getChannelInviteLink: async (bot, chatId) => {
        const ops = {
            expire_date:  Date.now()+ 10000,
            member_limit: 1
        }
        let link = await bot.createChatInviteLink(chatId, ops);
        return link.invite_link;
    },

    getChatMember: async (bot, memberId, chatId)=>{
        bot.getChatMember(  memberId, chatId).then(res=>console.log(res));
    }
} 