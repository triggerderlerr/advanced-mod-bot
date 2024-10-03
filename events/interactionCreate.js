const { Collection, EmbedBuilder } = require("discord.js");
const db = require("croxydb");
const client = require("../index");
const config = require('../settings/config.json');
const moment = require('moment');

module.exports = async (client, interaction) => {
    if (!interaction.guild) {
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('Etkileşim Hatası')
            .setDescription(`🚫 | Bu komut, DM'de kullanılamaz!`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                { name: 'Ne Yapmalısınız?', value: 'Lütfen bu komutu botun olduğu bir sunucuda deneyin.', inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Bu mesaj otomatik olarak oluşturulmuştur.', iconURL: interaction.client.user.displayAvatarURL() });

        return interaction.reply({ embeds: [embed] });
    }

    if (!interaction.isCommand()) return;

    try {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) {
            return interaction.reply({ content: `${interaction.commandName} geçerli bir komut değil.`, ephemeral: true });
        }

        // Cooldown yönetimi
        if (!client.cooldown.has(interaction.commandName)) {
            client.cooldown.set(interaction.commandName, new Collection());
        }

        const now = Date.now();
        const timestamps = client.cooldown.get(interaction.commandName);
        const cooldownAmount = 30 * 1000; // Cooldown süresi 5 saniye

        if (!client.spamCount) {
            client.spamCount = new Collection();
        }

        const userSpamCount = client.spamCount.get(interaction.user.id) || 0;

        // Eğer spam sayısı 4 veya daha fazla ise, cooldown süresi uygula
        if (userSpamCount >= 4) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return interaction.reply({
                    content: `\`${interaction.commandName.toUpperCase()}\` Komutunu kullanmadan önce lütfen ${timeLeft.toFixed(1)} saniye bekleyiniz.`,
                    ephemeral: true,
                });
            }
        }

        if (!timestamps.has(interaction.user.id)) {
            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
            client.spamCount.set(interaction.user.id, 0);
        } else {
            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        }

        // Kullanıcının spam sayısını artır
        client.spamCount.set(interaction.user.id, userSpamCount + 1);

        // Komut çalıştırma
        console.log(`${interaction.guild.name}: Kullanıcı: ${interaction.user.username} => Komut: ${command.name}.`);
        await command.run(client, interaction, interaction.options);
    } catch (err) {
        console.error(err);
        return interaction.reply({ content: `Bir hata oluştu: ${err}`, ephemeral: true });
    }
};
