import client from "./client";
import exchange from "./exchange";
import * as gameInterface from "./interface";

// Used as dependency injection
void client;
void exchange;

gameInterface.initialize();
