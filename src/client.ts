import * as Discord from "discord.js";

import token from "./token.json";

const discordClient = new Discord.Client();

discordClient.on("ready", () => {
    console.log("Connected as " + discordClient.user.tag);
});

discordClient.login(token);

export default discordClient;
