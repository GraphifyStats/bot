import { Command } from "../../structures/Command";
import { EmbedBuilder } from "discord.js";

export default new Command({
  name: "membercount",
  description: "Tells you the amount of members that are in this server.",
  run: async ({ client, interaction }) => {
    const { guild } = interaction;
    await guild.members.fetch();
    const memberCount = guild.memberCount;
    const humanCount = guild.members.cache.filter((m) => !m.user.bot).size;
    const botCount = guild.members.cache.filter((m) => m.user.bot).size;

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .addFields(
            {
              name: "Members",
              value: memberCount.toLocaleString(),
            },
            {
              name: "Humans",
              value: humanCount.toLocaleString(),
            },
            {
              name: "Bots",
              value: botCount.toLocaleString(),
            }
          )
          .setColor(client.config.color),
      ],
    });
  },
});
