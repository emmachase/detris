import client from "./client";
import exchange from "./exchange";
import * as gameInterface from "./interface";
import Board from "./game/board";
import MinoGame from "./game";
import { GameOptions } from "./game/options";

// Used as dependency injection
// void client;
// void exchange;

gameInterface.initialize();

// const options = new GameOptions();
// const game = new MinoGame(options);

// setInterval(() => {
//     for (let i = 0; i < 6; i++) {
//         game.tickEngine();
//     }

//     console.log(game.toDiscord());
//     console.log(game.fallingMino.y);
// }, 100);
