import { ColorResolvable } from "discord.js";

export interface ClientConfig {
  color: ColorResolvable;
  guildId: string;
  environment: "dev" | "prod" | "debug";
  channels: {
    [key: string]: string;
  };
  roles: {
    [key: string]: string;
  };
}
