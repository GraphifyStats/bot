import { Feature } from "../structures/Feature";
import fs from "fs";
import Enmap from "enmap";

const counts = new Enmap("counts", {
  dataDir: "./counts",
});

export default new Feature((client) => {
  client.on("messageCreate", (message) => {
    if (message.content === "e") {
      counts.ensure("e", 0);
      message.reply({
        content: `EEEE! E has been said ${counts.get("e") + 1} times.`,
      });
      counts.inc("e");
    }
  });
});
