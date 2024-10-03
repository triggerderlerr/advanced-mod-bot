const { PermissionsBitField } = require("discord.js");

module.exports = {
    name: "herkese-rol-ver",
    description: "Herkese belirlediğiniz bir rolü verir.",
    type: 1,
    options: [
        {
            name: "rol",
            description: "Lütfen bir rol etiketle!",
            type: 8, // 8 corresponds to the ROLE type
            required: true,
        },
    ],

    run: async (client, interaction) => {
        // Check if the user has the required permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "Bunun için gerekli yetkin yok!", ephemeral: true });
        }

        const rol = interaction.options.getRole('rol');

        // Notify that roles are being distributed
        await interaction.reply("Roller dağıtılıyor...");

        // Add the role to each member
        const members = await interaction.guild.members.fetch(); // Fetch all members

        let successCount = 0;
        let failureCount = 0;

        for (const member of members.values()) {
            try {
                await member.roles.add(rol);
                successCount++;
            } catch (error) {
                console.error(`Failed to add role to ${member.user.tag}: ${error}`);
                failureCount++;
            }
        }

        // Send a confirmation message
        await interaction.followUp(`Roller başarıyla dağıtıldı! Başarıyla atanan rol sayısı: ${successCount}, Hata sayısı: ${failureCount}`);
    },
};
