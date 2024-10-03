const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { Client, GatewayIntentBits, Partials } = require("discord.js");

module.exports = async (client) => {

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: client.slashCommands,
    });
  } catch (error) {
    console.error(error);
  }
  
    console.log(`[✅] ${client.user.username} Hazır! `);
    client.user.setActivity(`/yardım`)
};
