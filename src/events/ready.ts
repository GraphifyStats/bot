import { Event } from "../structures/Event";
import dashboard from "../web";

export default new Event("ready", (client) => {
  console.log(`${client.user?.tag} is now online!`);
  dashboard.run(client);
});
