module.exports = {
    getChannelInviteLink: async (bot, chatId) => {
        const ops = {
            member_limit: 1,
            expire_date: Date.now()/1000 + 60*30
        } 
        try {
            let link = await bot.createChatInviteLink(chatId, ops);
            return link.invite_link;
        }catch (err) {console.log(err)}
        
        
    },

    getChatMember: async (bot, memberId, chatId)=>{
        bot.getChatMember(  memberId, chatId).then(res=>console.log(res));
    },

    generateKey: ()=>{
        const key = Math.floor( Math.random() * (9999 - 1000) + 1000);
        return key;
    },

    banUser: ()=>{},
    unbanUser: ()=>{}
} 