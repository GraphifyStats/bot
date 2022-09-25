import "dotenv/config";
import { Bot } from "./structures/Client";
import { ActivityType } from "discord.js";

export const client = new Bot({
  presence: {
    activities: [
      {
        name: "the Graphify team",
        type: ActivityType.Watching,
      },
    ],
  },
});

client.start();
