const db = require("croxydb")
module.exports = async (client, message) => {
	const embedBuilder = require("../utils/embeds");
	const logchannel = db.get(`logchannels_${message.guild.id}`)
	const kanal = message.guild.channels.cache.get(logchannel)
	if (!kanal) return;
	
  if (message.guild.id !== message.guild.id) return;
  if (message.author.bot) return;
	const logdurum = db.get(`logdurum_${message.guild.id}`)
	if (logdurum === 'açık') {
  await kanal.send({
    embeds: [embedBuilder.messageD(client, message)],
  });
  }
};

