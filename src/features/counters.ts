import { Feature } from "../structures/Feature";
import Enmap from "enmap";

const counts = new Enmap("counts", {
  dataDir: "./databases/counts",
});

export default new Feature((client) => {
  client.on("messageCreate", (message) => {
    if (message.content.startsWith("e")) {
      counts.ensure("e", 0);
      message.reply({
        content: `EEEE! E has been said ${counts.get("e") + 1} times.`,
      });
      counts.inc("e");
    }
  });
});
