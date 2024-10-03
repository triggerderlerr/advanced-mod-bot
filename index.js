const { ChannelType, Client, REST, Routes, Collection, GatewayIntentBits, Partials, AuditLogEvent, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const path = require('path')
const Discord = require("discord.js")
const db = require("croxydb")
const moment = require('moment');
const config = require('./settings/config.json');
const keep_alive = require('./utils/keep_alive.js')
const {readdirSync} = require("fs")
const AntiSpam = require("discord-anti-spam");
require('dotenv').config({ path: path.resolve(__dirname, '.env') })
const client = new Client({
  intents: INTENTS,
  allowedMentions: {
    parse: ["users"]
  },
  partials: PARTIALS,
  retryLimit: 3
});
require("./utils/connect")();
global.client = client;
client.commands = (global.commands = []);
client.slashCommands = new Collection();
client.cooldown = new Collection();

//============== COMMAND READER =================

(async () => {
  
    await load_slash_commands()

})()

async function load_slash_commands() {
    console.log("Slash Komutları Yükleniyor.")

    const slash = [];

    readdirSync('./commands/').forEach(async (dir) => {
        const commands = readdirSync(`./commands/${dir}`).filter((file) => file.endsWith(".js"));

        for (const file of commands) {
            const pull = require(`./commands/${dir}/${file}`);

            try {
                if (!pull.name || !pull.description) {
                    console.log(`Missing a name, description or run function in ${file} slash command.`, "error")
                    continue;
                }

                const data = {};
                for (const key in pull) {
                    data[key.toLowerCase()] = pull[key];
                }

                slash.push(data);

                pull.category = dir;
                client.slashCommands.set(pull.name, pull);

                console.log(`[${pull.category.toUpperCase()}] ${pull.name}`, "komutu yüklendi.")
            } catch (err) {
                console.log(`Komut Yüklenemedi ${file}, Hata: ${err}`, "error")
                continue;
            }
        }
    })

}

//================================================================

//======================== EVENT LOADER ==========================

readdirSync('./events').forEach(e => {

  const eve = require(`./events/${e}`);
  const name = e.split(".")[0];

  client.on(name, (...args) => {
    eve(client, ...args)
  });
  console.log(`[EVENT] ${name} eventi yüklendi.`)
});

//=================================================================


//======================= KANAL STATS SİSTEMİ =============================

client.once('ready', message => {

  setInterval(() => { 
  client.guilds.cache.each(guild => {
    const statsdurum = db.get(`statsdurum_${guild.id}`);
    if (statsdurum === 'açık') {
    const stats = db.get(`statkanal4_${guild.id}`) || ""
    client.channels.cache.get(stats).setName(`🟢 ${guild.members.cache.filter(m => m.presence?.status == 'online').size} ⛔ ${guild.members.cache.filter(m => m.presence?.status == 'dnd').size} 🌙 ${guild.members.cache.filter(m => m.presence?.status == 'idle').size} ⚫ ${guild.members.cache.filter(m => m.presence?.status == 'offline' || !m.presence).size} `)
   // console.log(`[!] Güncelledim!`);
  }});
  }, 600000);

 //console.log(`[!] Stats kanalları hazır!`);

});

client.on("guildMemberAdd", member => {

  const toplam = db.get(`statkanal1_${member.guild.id}`) || ""
  const uye = db.get(`statkanal2_${member.guild.id}`) || ""
  const bot = db.get(`statkanal3_${member.guild.id}`) || ""

  if (!bot) return;

  member.guild.channels.cache.get(toplam).setName(`💜 Toplam ${member.guild.memberCount}`)
  member.guild.channels.cache.get(uye).setName(`💜 Uye ${member.guild.members.cache.filter((m) => !m.user.bot).size}`); // This text is also changeable, still keep the code in ${}'s
  member.guild.channels.cache.get(bot).setName(`🤖 Bot - ${member.guild.members.cache.filter(member => member.user.bot).size}`)

});

client.on("guildMemberRemove", (member) => {

  const toplam = db.get(`statkanal1_${member.guild.id}`) || ""
  const uye = db.get(`statkanal2_${member.guild.id}`) || ""
  const bot = db.get(`statkanal3_${member.guild.id}`) || ""

  if (!bot) return;

  member.guild.channels.cache.get(toplam).setName(`💜 Toplam ${member.guild.memberCount}`)
  member.guild.channels.cache.get(uye).setName(`💜 Uye ${member.guild.members.cache.filter((m) => !m.user.bot).size}`); // This text is also changeable, still keep the code in ${}'s
  member.guild.channels.cache.get(bot).setName(`🤖 Bot - ${member.guild.members.cache.filter(member => member.user.bot).size}`)

});


//======================= KANAL STATS SİSTEMİ SON =============================

//======================= ANTI SPAM SİSTEMİ =============================


const antiSpam = new AntiSpam({
  
  warnThreshold: 4, // Amount of messages sent in a row that will cause a warning.
  muteTreshold: 6, // Amount of messages sent in a row that will cause a mute.
  kickTreshold: 9, // Amount of messages sent in a row that will cause a kick.
  banTreshold: 12, // Amount of messages sent in a row that will cause a ban.
  warnMessage: "Spamı durdur yoksa ceza alacaksın!", // Message sent in the channel when a user is warned.
  //==================== EMBEDS ========================
  actionInEmbed:true,
  muteEmbedTitle:'Susturuldu!',
  muteEmbedDescription: "**{user_tag}** spam yaptığın için susturuldun.", // Message sent in the channel when a user is muted.
  muteEmbedFooter:'{user_tag}',
  warnEmbedTitle:'Uyarı!',
  warnEmbedDescription:'Spam yaptığın için uyarı aldın.\n Devam edersen zaman aşımı uygulanacak!',
  warnEmbedFooter:'{user_tag}',
  embedFooterIconURL:'https://cdn.discordapp.com/avatars/440222721079508993/9cf2412b8ca45a9a86da68998a3a3de7.png?size=4096',
  //==================== EMBEDS SON========================
  kickMessage: "You have been kicked for spamming!", // Message sent in the channel when a user is kicked.
  banMessage: "You have been banned for spamming!", // Message sent in the channel when a user is banned.
  maxInterval: 2000, // hangi aralıklarla mesaj kontrol edilsin
  unMuteTime: 1, // Zaman aşımı uygulanacak süre örn: 1 = 1 dakika
  verbose: true, // Whether or not to log every action in the console.
  removeMessages: true, // Mesajlar silinsin mi?
  ipwarnEnabled: false, //whether to delete ip addresses in channels or not.
  ignoredPermissions: [PermissionsBitField.Flags.Administrator], // whitelist yetkileri
  ignoredRoles:[''], // whitelist rolleri
  
  deleteMessagesAfterBanForPastDays: 7,
  banEnabled: false,
  muteEnabled: true,
  kickEnabled: false,
  warnEnabled: true,
  ignoreBots: true,


});

client.on('messageCreate', (msg) => {
  if (!msg.guild) return;
  const antispam = db.get(`antispam_${msg.guild.id}`, 'açık')
  if	(antispam) {
	antiSpam.message(msg);
  }
});


//======================= ANTI SPAM SİSTEMİ SON =============================

client.login(process.env.TOKEN).catch(err => {
  console.error('[!] Geçersiz token.Giriş yapılamadı!')
  //process.exit(1)
});


process.on('unhandledRejection', error => {
	return console.error(`[HATA] - ${error}`);
});

process.on('uncaughtException', error => {
  return console.error(`[HATA] - ${error}`);
});

client.on('warn', m => {
   console.log(`[WARN - 1] - ${m}`)
});

client.on('error', m => {
  console.log(`[HATA - 1] - ${m}`)
});


//client.on('messageCreate', async message => {
//if (message.content.toLowerCase() === 'kur') {

//}});



 
       


//======================= HG SİSTEMİ =============================

