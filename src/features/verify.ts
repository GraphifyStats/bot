import { Feature } from "../structures/Feature";
import {
  MessageCreateOptions,
  TextChannel,
  GuildMemberRoleManager,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export default new Feature("verify", (client) => {
  // message sending and editing
  client.on("ready", async () => {
    const options: MessageCreateOptions = {
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ Verification")
          .setDescription(
            "To verify yourself and gain access to the rest of the server, click on the button below."
          )
          .setColor("DarkGreen"),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("verify")
            .setStyle(ButtonStyle.Success)
            .setLabel("Verify")
        ),
      ],
    };

    const channel = (await client.channels.fetch(
      client.config.channels.verify
    )) as TextChannel;

    channel?.messages.fetch().then((messages) => {
      if (messages.size === 0) {
        channel.send(options);
      } else {
        for (const message of messages) {
          message[1].edit(options);
        }
      }
    });
  });

  // button pressing
  client.on("interactionCreate", (int) => {
    if (!int.isButton()) return;
    if (int.customId !== "verify") return;

    const memberRoles = int.member.roles as GuildMemberRoleManager;

    const role = int.guild.roles.cache.get(client.config.roles.member);
    if (memberRoles.cache.has(role.id)) {
      int.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ You're already verified.")
            .setColor("Red"),
        ],
        ephemeral: true,
      });
      return;
    }

    memberRoles.add(role);

    int.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("✅ You are now verified!")
          .setDescription(`Have fun chatting in ${int.guild.name}!`)
          .setColor("DarkGreen"),
      ],
      ephemeral: true,
    });
  });
});
