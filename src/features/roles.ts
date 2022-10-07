import { Feature } from "../structures/Feature";
import {
  MessageCreateOptions,
  TextChannel,
  GuildMemberRoleManager,
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export default new Feature((client) => {
  const roles: Object = {
    upload: "1003518031365931008",
    livestream: "1023503398751969352",
    announcement: "1003658192762441738",
    discussion: "1024314741855879218",
    chaos: "1027112529517879317",
    jipstats: "1000689439087013989",
    graphify: "1023427951703900230",
    ummerate: "1027875989587497020",
  };

  // message sending and editing
  client.on("ready", async () => {
    const options: Array<MessageCreateOptions> = [
      {
        embeds: [
          new EmbedBuilder()
            .setTitle("🔔 Ping Roles")
            .setDescription(
              `<:uploadping:1017706882514833448> Upload Ping\n> Get pinged when JipStats or Graphify posts a new video.\n<:live:1023545225177747467> Livestream Ping\n> Get pinged whenever JipStats or Graphify starts a new livestream.\n📣 Announcement Ping\n> Get pinged whenever we annouce something.\n🗨️ Discussion Ping\n> Get pinged whenever a new discussion starts.\n😡 Chaos Ping\n> Get pinged whenever chaos is happening.`
            )
            .setColor(client.config.color),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId("upload")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("1017706882514833448"),
            new ButtonBuilder()
              .setCustomId("livestream")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("1023545225177747467"),
            new ButtonBuilder()
              .setCustomId("announcement")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("📣"),
            new ButtonBuilder()
              .setCustomId("discussion")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("🗨️"),
            new ButtonBuilder()
              .setCustomId("chaos")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("😡")
          ),
        ],
      },
      {
        embeds: [
          new EmbedBuilder()
            .setTitle("🤔 Which channel are you subscribed to?")
            .setColor(client.config.color),
        ],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId("jipstats")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("1024667803678146650")
              .setLabel("JipStats"),
            new ButtonBuilder()
              .setCustomId("graphify")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("1024667806366699550")
              .setLabel("Graphify"),
            new ButtonBuilder()
              .setCustomId("ummerate")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("1027879017816281160")
              .setLabel("Ummerate")
          ),
        ],
      },
    ];

    const channel = (await client.channels.fetch(
      client.config.channels.roles
    )) as TextChannel;

    channel?.messages.fetch().then((messages) => {
      if (messages.size === 0) {
        for (const option of options) {
          channel.send(option);
        }
      } else {
        for (const message of messages) {
          if (message[1].embeds[0].title.startsWith("🔔")) {
            message[1].edit(options[0]);
          } else if (message[1].embeds[0].title.startsWith("🤔")) {
            message[1].edit(options[1]);
          }
        }
      }
    });
  });

  // button pressing
  client.on("interactionCreate", (int) => {
    if (!int.isButton()) return;
    if (!roles.hasOwnProperty(int.customId)) return;
    addRole(roles[int.customId], int);
  });

  function addRole(id: string, int: ButtonInteraction) {
    const memberRoles = int.member.roles as GuildMemberRoleManager;

    const role = int.guild.roles.cache.get(id);
    if (memberRoles.cache.has(role.id)) {
      memberRoles.remove(role);
      int.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`✅ You no longer have the ${role.name} role.`)
            .setColor("DarkGreen"),
        ],
        ephemeral: true,
      });
      return;
    }

    memberRoles.add(role);

    int.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`✅ You now have the ${role.name} role!`)
          .setColor("DarkGreen"),
      ],
      ephemeral: true,
    });
  }
});
