import { Command } from "../../structures/Command";
import { EmbedBuilder } from "discord.js";

export default new Command({
  name: "ping",
  description: "Pings the Discord API.",
  run: async ({ client, interaction }) => {
    await interaction
      .reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Pinging...")
            .setColor(client.config.color),
        ],
        ephemeral: true,
        fetchReply: true,
      })
      .then((res) => {
        const ping = res.createdTimestamp - interaction.createdTimestamp;

        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("🏓 Pong!")
              .addFields(
                {
                  name: "🤖 Bot",
                  value: `\`\`\`${ping}ms\`\`\``,
                  inline: true,
                },
                {
                  name: "📶 API",
                  value: `\`\`\`${client.ws.ping}ms\`\`\``,
                  inline: true,
                }
              )
              .setColor(client.config.color),
          ],
        });
      });
  },
});
