import { Command } from "../../structures/Command";
import {
  EmbedBuilder,
  AttachmentBuilder,
  ApplicationCommandOptionType,
  GuildMember,
} from "discord.js";

export default new Command({
  name: "avatar",
  description: "Gets the avatar of specific person, or yourself.",
  options: [
    {
      name: "member",
      description: "The user to get the avatar from.",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
  run: async ({ client, interaction }) => {
    const member =
      (interaction.options.getMember("member") as GuildMember) ||
      interaction.member;
    const avatar = member.user.displayAvatarURL();

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(member.displayName + "'s Avatar")
          .setDescription(
            "[Click here to download](" + avatar.replace("webp", "png") + ")"
          )
          .setImage(avatar)
          .setColor(client.config.color),
      ],
    });
  },
});
