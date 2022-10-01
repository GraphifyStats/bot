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

export interface DashboardConfig {
  clientId: string;
  port: number;
  domain: string;
  callback: string;
  banned: Array<string>;
}
