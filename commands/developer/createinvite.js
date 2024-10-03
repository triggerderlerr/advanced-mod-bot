const { PermissionsBitField, ChannelType } = require("discord.js");
const db = require("croxydb")
const config = require('../../settings/config.json');
const backup = require("@outwalk/discord-backup");
module.exports = {
  name: "create-invite",
  description: "Bir sunucu daveti oluşturur.",
  type: 1,
    options:[
        {
            name:"id",
            description:"Sunucu ID\'si.",
            type:3,
            required:true
        },
      ],
  
  run: async(client, message) => {
    
    if(!(message.user.id === config.owner)) return message.reply({content: "Bunun için gerekli yetkiniz bulunmuyor!", ephemeral: true})    

    let serverID = message.options.getString('id')
    var invites = []; // starting array
    const guild = client.guilds.cache.get(serverID);

    
      // get the first channel that appears from that discord, because
      // `.createInvite()` is a method for a channel, not a guild.
      const channel = guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText).first();
  try {
      await channel
        .createInvite({ maxAge: 0, maxUses: 0 })
        .then(async (invite) => {
          invites.push(`${guild.name} - ${invite.url}`); // push invite link and guild name to array
            message.reply(`${invites}`)
        })
    }catch {
    message.reply(`Botun gerekli izni bulunmuyor.`)
      } 
    
    //  console.log(invites);
  
      


}};