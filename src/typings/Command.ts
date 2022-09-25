import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  GuildMember,
} from "discord.js";
import { Bot } from "../structures/Client";

export interface CmdInteraction extends CommandInteraction {
  member: GuildMember;
}

interface RunOptions {
  client: Bot;
  interaction: CmdInteraction;
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = {
  run: RunFunction;
} & ChatInputApplicationCommandData;
