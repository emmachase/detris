import client from "./client";
import exchange from "./exchange";
import * as gameInterface from "./interface";

gameInterface.initialize();

setInterval(() => {
    // Prevent them from being garbage collected hopefully
    console.log("WHAT", client, exchange);
}, 5000);
