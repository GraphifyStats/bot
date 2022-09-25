import {
  ApplicationCommandDataResolvable,
  Client,
  ClientOptions,
  ClientEvents,
  Collection,
} from "discord.js";
import glob from "glob";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { CommandType } from "../typings/Command";
import { RegisterCommandsOptions } from "../typings/client";
import { ClientConfig } from "../typings/Config";
import { Event } from "./Event";
import { Feature } from "./Feature";

const globPromise = promisify(glob);

type BotOptions = Omit<ClientOptions, "intents">;

export class Bot extends Client {
  commands: Collection<string, CommandType> = new Collection();
  config: ClientConfig = require("../../config.json");

  constructor(options: BotOptions = {}) {
    super({
      intents: ["Guilds", "GuildMessages", "GuildMembers", "MessageContent"],
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
        guildId: this.config.guildId,
      });
    });

    // Events
    const eventFiles = fs
      .readdirSync("./src/events")
      .filter((file) => file.endsWith(".ts"));

    for (const file of eventFiles) {
      const event: Event<keyof ClientEvents> = await this.importFile(
        `../events/${file}`
      );
      this.on(event.event, event.run.bind(null, this));
    }

    // Features
    const readFeatures = async (dir) => {
      const files = fs.readdirSync(path.join(__dirname, dir));
      for (const file of files) {
        const stat = fs.lstatSync(path.join(__dirname, dir, file));
        if (stat.isDirectory()) {
          readFeatures(path.join(dir, file));
        } else {
          const feature: Feature = await this.importFile(
            path.join(__dirname, dir, file)
          );
          feature.run(this);
        }
      }
    };

    readFeatures("../features/");
  }
}
