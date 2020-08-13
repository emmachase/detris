import Discord from "discord.js";
import exchange, { EmojiCommandBuilder } from "./exchange";
import { GameOptions } from "./game/options";
import MinoGame from "./game";
import { Controls } from "./emojis";

function constructEmbed(game: MinoGame) {
    if (game.lost) {
        return new Discord.MessageEmbed()
            .setTitle("Finished Detris Game")
            .setDescription(game.boardToDiscord())
            .addField("Score", game.score.toString(), true)
            .addField("Lines Cleared", game.linesCleared.toString(), true)
            .addField("Lose Reason:", game.loseReason);

    } else {
        let embed = new Discord.MessageEmbed()
            .setTitle("Active Detris Game")
            .setDescription(game.boardToDiscord())
            .addField("Held Piece", game.heldToDiscord(), true)
            .addField("Score", game.score.toString(), true)
            .addField("Next", game.nextToDiscord(3))
            .addField("Last Clear", game.consumeMessage() ?? "...", true);

        const queuedGarbage = game.countQueuedGarbage();
        if (queuedGarbage > 0) {
            embed = embed.addField("Queued Garbage", queuedGarbage.toString(), true);
        }

        return embed;
    }
}

interface GameState {
    channel: Discord.Channel,
    host: Discord.Snowflake, // Id of User who started the game
    game: MinoGame,
    quit(): Promise<void>
}

export function initialize() {
    const loadingGames: Set<Discord.Snowflake> = new Set();
    const runningGames: Record<Discord.Snowflake, GameState> = {};

    async function startNewGame(msg: Discord.Message) {
        const existingGame = runningGames[msg.channel.id];
        if (existingGame || loadingGames.has(msg.channel.id)) {
            return msg.reply("There is already a game going in this channel! Use " + exchange.prefix + "giveup to stop this one.")
        }

        // Mark this channel as loading
        loadingGames.add(msg.channel.id);

        const options = new GameOptions();
        const game = new MinoGame(options);

        const channel = msg.channel;
        const gMsg = await channel.send(constructEmbed(game));

        const emojiCommands = await new EmojiCommandBuilder(exchange)
            .addCommand(Controls.left,  () => game.tryMove(-1))
            .addCommand(Controls.right, () => game.tryMove( 1))
            .addCommand(Controls.soft,  () => game.dropPiece(false))
            .addCommand(Controls.hard,  () => game.dropPiece(true))

            .addCommand(Controls.ccw,  () => game.tryRotate(-1))
            .addCommand(Controls.cw,   () => game.tryRotate( 1))
            .addCommand(Controls.flip, () => game.tryRotate( 2))

            .addCommand(Controls.hold, () => game.tryHold())
            .execute(gMsg);

        let gameLoop: NodeJS.Timeout;
        gameLoop = setInterval(async () => {
            if (game.lost) return; // Must've quit

            for (let i = 0; i < 60; i++) {
                game.tickEngine();
                if (game.lost) {
                    runningGames[msg.channel.id] = undefined;
                    
                    clearInterval(gameLoop);
                    await emojiCommands.finish(); // Clear the controls away

                    break;
                }
            }

            await gMsg.edit(constructEmbed(game));
        }, 2000);

        runningGames[channel.id] = {
            quit: async () => {
                game.lost = true;
                game.loseReason = "Gave up";
                
                clearInterval(gameLoop);
                await emojiCommands.finish();
                await gMsg.edit(constructEmbed(game));
            },
            host: msg.author.id,
            channel, game
        };

        loadingGames.delete(msg.channel.id);
    }

    exchange.addCommand("newgame", startNewGame);

    exchange.addCommand("giveup", async msg => {
        const game = runningGames[msg.channel.id];
        if (!game) {
            return msg.reply("There isn't a running Detris game in this channel! Use " + exchange.prefix + "newgame to start one.");
        }

        if (msg.author.id !== game.host) {
            return msg.reply("You cannot stop a game you didn't start!");
        }

        // Quit the game
        runningGames[msg.channel.id] = undefined;
        game.quit();
    });

    exchange.addCommand("restart", async msg => {
        const game = runningGames[msg.channel.id];
        if (!game) {
            return msg.reply("There isn't a running Detris game in this channel! Use " + exchange.prefix + "newgame to start one.");
        }

        if (msg.author.id !== game.host) {
            return msg.reply("You cannot restart a game you didn't start!");
        }

        // Quit the game
        runningGames[msg.channel.id] = undefined;
        await game.quit();
        startNewGame(msg);
    });
}
