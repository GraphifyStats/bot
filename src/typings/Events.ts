import { ClientEvents, ChatInputCommandInteraction } from "discord.js";

export interface ExtendedEvents extends ClientEvents {
  interactionCreate: [interaction: ChatInputCommandInteraction<"cached">];
}
