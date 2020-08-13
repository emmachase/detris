import client from "./client";
import exchange from "./exchange";
import * as gameInterface from "./interface";

gameInterface.initialize();

setInterval(() => {
    // Prevent them from being garbage collected hopefully
    console.log("WHAT");
    
    const x = [client, exchange];
    console.log(x.length, client.ws.status);
}, 1000);
