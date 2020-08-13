import * as Discord from "discord.js";

import token from "./token.json";

const discordClient = new Discord.Client();

discordClient.on("ready", () => {
    console.log("Connected as " + discordClient.user.tag);
    discordClient.user.setPresence({
        activity: {
           name: "type ^newgame to start" 
        }
    })
});

discordClient.on("error", e => {
	// Oh no, let"s try restarting
    console.error("Encountered an error: " + e);
    console.error("Restarting")
	setTimeout(() => process.exit(1), 10000);
})

discordClient.on('disconnect', function(msg, code) {
    console.error("Disconnected:", msg);
    discordClient.login(token);
});

setInterval(() => {
	if (discordClient.user === null || discordClient.ws.status == 5) {
		console.error("WATCHDOG: Discord User is not active, attempting restart...");
		setTimeout(() => process.exit(1), 10000);
	}
}, 10000);

discordClient.login(token);

// LAST DITCH ERROR HANDLING; Is technically deprecated, care for future
process.on("unhandledRejection", (err) => {
    console.error("FATAL REJECTION: " + err);
});
process.on("uncaughtException", (err) => {
    console.error("FATAL: " + err);
});

export default discordClient;
