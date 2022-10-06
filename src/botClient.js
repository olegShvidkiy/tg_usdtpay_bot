// const { Api, TelegramClient } = require('telegram')
// const { StringSession } = require('telegram/sessions')

// class ClientBot {
//     constructor(apiId, apiHash, stringSession){
//         this.stringSession = new StringSession(stringSession);
//         this.client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
//         this.start();
//     }

//     async start(){
//         await client.start();
//     }

//     async getAndParse(){}
// }




// const apiId = 8378465
// const apiHash = 'b8368d4f9cfb9e6189be3b8c80c6635d'
// const stringSession = new StringSession(process.env.STRING_SESSION); // fill this later with the value from session.save()
// const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });

// (async () => {
//     await client.start();
//     const result = await client.invoke(
//         new Api.channels.GetMessages({
//           channel: "BinanceFunding",
//           id: [1000],
//         })
//       );
//       const array = result.messages[0].message.split("\n")
//       const index = array.indexOf('Shorts pay Longs if negative:');
//       const newArray = [];
//       for(let i = index - 7; i < index + 8; i ++){
//         newArray.push(array[i]);
//       };
//       newArray.unshift(array[1]);
//       newArray.unshift(array[0]);
//       console.log(newArray.join("\n"))
//       const message = newArray.join("\n");
//       client.sendMessage('me', { message: message });
//     // client.addEventHandler((update)=>{if(update?.message?.post) console.log(update?.message)})
// })()
