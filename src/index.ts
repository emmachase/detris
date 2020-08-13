import client from "./client";
import exchange from "./exchange";
import * as gameInterface from "./interface";

gameInterface.initialize();

setInterval(() => {
    // Prevent them from being garbage collected hopefully
    void client;
    void exchange;
}, 10000);
