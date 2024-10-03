const { PermissionsBitField, ActivityType } = require("discord.js");
const db = require("croxydb")
const config = require('../../settings/config.json');
module.exports = {
    name:"leave",
    description: 'Bot\'u sunucudan çıkarır!',
    type:1,
    options:[
        {
            name:"id",
            description:"Bot\'u sunucudan çıkarır.",
            type:3,
            required:true
        },
      ],
  run: async(client, interaction, args) => {

    if(!(interaction.user.id === config.owner)) return interaction.reply({content: "Bunun için gerekli yetkiniz bulunmuyor!", ephemeral: true}) 
    
    let serverID = interaction.options.getString('id')

   // var targetGuild = message.content.split(" ")[1];
    if (!serverID) // targetGuild is undefined if an ID was not supplied
        return interaction.reply("You must supply a Guild ID");


    client.guilds.cache.get(serverID) // Grab the guild
        .leave() // Leave
        .catch(console.error);
    interaction.reply(`Bot Başarıyla ${serverID} ID'li Sunucudan Ayrıldı.`)
    
}};