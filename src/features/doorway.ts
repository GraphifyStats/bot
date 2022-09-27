import { Feature } from "../structures/Feature";
import { TextChannel, EmbedBuilder } from "discord.js";

function ordinalSuffix(i: number) {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

export default new Feature((client) => {
  client.on("guildMemberAdd", (member) => {
    const channel = member.guild.channels.cache.get(
      client.config.channels.doorway
    ) as TextChannel;

    if (!channel) return;

    channel.send({
      content: `<@${member.id}>`,
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Welcome ${member.user.username}!`,
            iconURL: member.guild.iconURL(),
          })
          .setDescription(
            `We are happy to see you join **${
              member.guild.name
            }**!\nYou are the **${ordinalSuffix(
              member.guild.memberCount
            )}** member!\nPlease make sure to read the <#${
              client.config.channels.rules
            }>.`
          )
          .setThumbnail(member.user.displayAvatarURL())
          .setColor(client.config.color),
      ],
    });
  });
});
