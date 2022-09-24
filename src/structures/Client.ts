import {
  ApplicationCommandDataResolvable,
  Client,
  ClientOptions,
  ClientEvents,
  Collection,
} from "discord.js";
import { CommandType } from "../typings/Command";
import glob from "glob";
import { promisify } from "util";
import fs from "fs";
import { RegisterCommandsOptions } from "../typings/client";
import { Event } from "./Event";

const globPromise = promisify(glob);

export class Bot extends Client {
  commands: Collection<string, CommandType> = new Collection();

  constructor(options: Omit<ClientOptions, "intents"> = {}) {
    super({
      intents: ["Guilds", "GuildMessages", "MessageContent"],
      ...options,
    });
  }

  start() {
    this.registerModules();
    this.login(process.env.token);
  }
  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    if (guildId) {
      const guild = this.guilds.cache.get(guildId);
      guild?.commands.set(commands);
      console.log(`Registering commands to ${guild.name}`);
    } else {
      this.application?.commands.set(commands);
      console.log("Registering global commands");
    }
  }

  async registerModules() {
    // Commands
    const slashCommands: ApplicationCommandDataResolvable[] = [];
    fs.readdirSync("./src/commands").forEach(async (dir) => {
      const commandFiles = fs
        .readdirSync(`./src/commands/${dir}`)
        .filter((file) => file.endsWith(".ts"));

      for (const file of commandFiles) {
        const command: CommandType = await this.importFile(
          `../commands/${dir}/${file}`
        );
        if (!command.name) return;

        this.commands.set(command.name, command);
        slashCommands.push(command);
      }
    });

    this.on("ready", () => {
      this.registerCommands({
        commands: slashCommands,
        guildId: process.env.guildId,
      });
    });

    // Event
    const eventFiles = fs
      .readdirSync("./src/events")
      .filter((file) => file.endsWith(".ts"));

    for (const file of eventFiles) {
      const event: Event<keyof ClientEvents> = await this.importFile(
        `../events/${file}`
      );
      this.on(event.event, event.run.bind(null, this));
    }
  }
}
