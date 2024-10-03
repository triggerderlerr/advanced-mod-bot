const {
  Client,
  GatewayIntentBits,
  Partials,
  AuditLogEvent,
  PermissionsBitField
} = require("discord.js");

const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const Discord = require("discord.js")
const db = require("croxydb")
const moment = require('moment');
const config = require('../settings/config.json');



//======================= KAYIT SİSTEMİ =============================

module.exports = async (client, member, reason) => {
    const kayıtknl = db.get(`kayitkanal_${member.guild.id}`)
  if (kayıtknl) {
  const kayıtsızrol = db.get(`otorol_${member.guild.id}`)
  const kayıtkanal = db.get(`kayitkanal_${member.guild.id}`)
  const kayıtgif = db.get(`kayıtgif_${member.guild.id}`)
  
  const avatar = client.user.displayAvatarURL({dynamic: true})
  const username = client.user.username

  const rightarrow = member.guild.emojis.cache.find(emoji => emoji.name === config.rightarrow);
  const verify = member.guild.emojis.cache.find(emoji => emoji.name === config.verify);

  const kayıtsızNick = "Isim | Yaş" == "" ? null : "Isim | Yaş"

  if (kayıtsızNick) await member.setNickname(kayıtsızNick)
  if (!kayıtkanal) return console.log("Kayıt kanalı bulunamadı.");
  if (!kayıtsızrol) return console.log("Kayıtsız rol bulunamadı.");
  if (!kayıtgif) return console.log("Kayıt GIF'i bulunamadı.");

 // setTimeout(function () {
    member.roles.add(kayıtsızrol).catch(() => {})
  //}, 150)
  
  var kurulus = (Date.now() - member.user.createdTimestamp);

  let user = client.users.cache.get(member.id);

  var kurulus = (Date.now() - member.user.createdTimestamp);
      const ayyy = moment.duration(kurulus).format("M");
      var kontrol = [];
    
      if (ayyy < 1) {
        kontrol = `   \Şüpheli ❌\ `;
      }
      if (ayyy > 1) {
        kontrol = `   \Güvenilir ✅\ `;
      }

  const embed = new Discord.EmbedBuilder()
    .setColor("Random")
    .setAuthor({name: `${username}`,iconURL: `${avatar}`,url: 'https://discord.gg/zGwFVQkX'})

    .setDescription(`<@${member.user.id}>, Aramıza **Hoşgeldin!**

   • Seninle Beraber **${member.guild.memberCount}** Kişiyiz.\n
   • Kayıt Olmak Için **Ses Teyit** Odalarından Birine Geçip Bekleyiniz.\n
   • Kayıt Tarihi: **${moment.utc(member.user.createdAt).format('DD.MM.YY')}**\n
   • Bu Hesap **${kontrol}**\n
   • **Bol keyifli zaman geçirmeniz dileğiyle..**
   `, true)

    .setTimestamp()
    .setImage(`${kayıtgif}`)

  member.guild.channels.cache.get(kayıtkanal).send({embeds: [embed]})
  }
  
  //==================== JOIN LOG ============================
  
	const embedBuilder = require("../utils/embeds");
	const logchannel = db.get(`logchannels_${member.guild.id}`)
	const kanal = member.guild.channels.cache.get(logchannel)
	const logdurum = db.get(`logdurum_${member.guild.id}`)
  	if (logdurum === 'açık') {
		// left system
  const embedBuilder = require("../utils/embeds");

  await kanal.send({
    embeds: [embedBuilder.guildMA(client, member, reason)],
	}); }
  
  //============================================================

};
