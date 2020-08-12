import exchange from "./exchange";
import { GameOptions } from "./game/options";
import MinoGame from "./game";
import { Controls } from "./emojis";

export function initialize() {
    exchange.addCommand("startdetris", async msg => {
        const options = new GameOptions();
        const game = new MinoGame(options);

        const channel = msg.channel;
        const gMsg = await channel.send(game.toDiscord());

        await exchange.addEmojiList(gMsg,
            Object.values(Controls));

        setInterval(async () => {
            for (let i = 0; i < 60; i++) {
                game.tickEngine();
            }

            await gMsg.edit(game.toDiscord());
            // console.log(game.toDiscord());
            // console.log(game.fallingMino.y);
        }, 2000);
    });
}
