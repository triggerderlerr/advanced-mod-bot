const backup = require("@outwalk/discord-backup");
module.exports = {
  name: "backup-load",
  description: 'Bir sunucu yedeği yüklersin.',
  type:1,
  options: [
      {
      name: "id",
      description: "Backup id\'si veya adı!",
      type: 3,
      required: true
    },
	],
  run: async (client, message, args) => {
    
  if(!(message.user.id === message.guild.ownerId)) return message.reply({content: "Bu komutu kullanabilmek için sunucu sahibi olmalısın.", ephemeral: true})
    
	const backupID = message.options.getString('id')
	
	message.reply("Lütfen bekleyin bu biraz zaman alabilir..")
	
	await backup.load(backupID, message.guild, {
    doNotLoad: ["roleAssignments", "emojis"],
    maxMessagesPerChannel: 0,
    clearGuildBeforeRestore: true,
    maxMessagesPerChannel: 10,
    speed: 250,
	});
    
    
}};
 