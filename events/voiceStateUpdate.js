const { ChannelType, Collection } = require("discord.js");
const schema = require("../utils/models/join-to-create");
let voiceManager = new Collection();
const embedBuilder = require("../utils/embeds");

module.exports = async (client, oldState, newState) => {
    const { member, guild } = oldState;
    const newChannel = newState.channel;
    const oldChannel = oldState.channel;

    // Veritabanından ilgili sunucuya ait veriyi çek
    const data = await schema.findOne({ Guild: guild.id });
    if (!data) return;  // Eğer veri yoksa geri dön

    const channelid = data.Channel;
    const channel = client.channels.cache.get(channelid);  // Hedef kanalı al
    const userlimit = data.UserLimit;

    // Kullanıcı eski ve yeni kanal arasında geçtiyse ve yeni kanal bizim belirlediğimiz kanalsa
    if (oldChannel !== newChannel && newChannel && newChannel.id === channel.id) {
        // Yeni sesli kanal oluştur
        const voiceChannel = await guild.channels.create({
            name: `${member.user.username}'s Room`,  // Kullanıcının adını yeni oda adı olarak kullan
            type: ChannelType.GuildVoice,            // Sesli kanal tipi
            parent: newChannel.parent,               // Aynı kategoride oluştur
            permissionOverwrites: [
                {
                    id: member.id,                  // Oda sahibi izinleri
                    allow: ["Connect", "ManageChannels", "ViewChannel"],
                },
                {
                    id: guild.id,                   // Sunucudaki tüm kullanıcılara izinler
                    allow: ["Connect", "ViewChannel"],
                },
            ],
            userLimit: userlimit || 0  // User limit veritabanında yoksa sınırsız (0) olacak
        });

        // Kullanıcının odasını kaydet
        voiceManager.set(member.id, voiceChannel.id);

        // Kullanıcıyı yeni oluşturulan kanala taşı
        setTimeout(() => {
            member.voice.setChannel(voiceChannel).catch(console.error);
        }, 500);

        // Yeni odada bir mesaj gönder (embed ile)
        setTimeout(() => {
            voiceChannel.send({
                embeds: [embedBuilder.modalreply(client, oldState, newState)],
                components: [embedBuilder.rowreply2(client, oldState, newState)],
            }).catch(console.error);
        }, 500);
    }

    // Eğer kullanıcı eski kanaldan çıkıyorsa ve bu eski kanal bizim oluşturduğumuz odaysa
    const jointocreate = voiceManager.get(member.id);
    if (jointocreate && oldChannel && oldChannel.id === jointocreate && (!newChannel || newChannel.id !== jointocreate)) {
        const members = oldChannel?.members
            .filter((m) => !m.user.bot)
            .map((m) => m.id);

        if (members.length > 0) {
            // Odayı boş bırakmamak için rastgele bir kullanıcıyı oda sahibi yap
            let randomID = members[Math.floor(Math.random() * members.length)];
            let randomMember = guild.members.cache.get(randomID);
            randomMember.voice.setChannel(oldChannel).then(() => {
                oldChannel.setName(randomMember.user.username).catch(() => null);
                oldChannel.permissionOverwrites.edit(randomMember, {
                    Connect: true,
                    ManageChannels: true
                }).catch(console.error);
            }).catch(console.error);
            
            voiceManager.set(member.id, null);
            voiceManager.set(randomMember.id, oldChannel.id);
        } else {
            // Oda boşsa sil
            voiceManager.set(member.id, null);
            oldChannel.delete().catch(() => null);
        }
    }
};
