import { InteractionType } from "discord.js";
import { Event } from "../structures/Event";
import { ExtendedInteraction } from "../typings/Command";

export default new Event("interactionCreate", async (client, interaction) => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    command.run({
      client,
      interaction: interaction as ExtendedInteraction,
    });
  }
});
