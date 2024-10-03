const { PermissionsBitField } = require("discord.js");
const db = require("croxydb");
const snowflake = require('../../utils/snowflake.js');

module.exports = {
    name: "emoji-oluştur",
    description: 'Yeni bir emoji ekleyin!',
    type: 1,
    options: [
        {
            name: "url",
            description: "Emoji URL.",
            type: 3,
            required: true
        },
        {
            name: "name",
            description: "Emoji ismi",
            type: 3,
            required: true
        },
    ],
    run: async (client, interaction, args) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: "Rolleri Yönet Yetkin Yok!", ephemeral: true });
        }

        const URL = interaction.options.getString('url');
        const name = interaction.options.getString('name');

        // URL'nin geçerliliğini kontrol et
        if (!URL.startsWith('https')) {
            return interaction.reply({ content: "Geçersiz URL. Lütfen geçerli bir URL girin.", ephemeral: true });
        }

        try {
            const emoji = await interaction.guild.emojis.create({ attachment: URL, name: name });
            return interaction.reply({ content: `Emoji başarıyla oluşturuldu: ${emoji}`, ephemeral: false });
        } catch {
            return interaction.reply({ content: "Hata: Emoji oluşturulamadı.", ephemeral: true });
        }
    }
};
