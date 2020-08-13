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
    quit(reason?: string): Promise<void>
}

export function initialize() {
    let maintenance: boolean = false;

    const loadingGames: Set<Discord.Snowflake> = new Set();
    const runningGames: Record<Discord.Snowflake, GameState> = {};

    async function startNewGame(msg: Discord.Message) {
        if (maintenance) {
            return msg.reply("Detris is currently down for maintenance. Please try again in a minute.");
        }

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
            .addCommand(Controls.dasleft,  () => game.tryMove(-Infinity))
            .addCommand(Controls.left,     () => game.tryMove(-1))
            .addCommand(Controls.right,    () => game.tryMove( 1))
            .addCommand(Controls.dasright, () => game.tryMove( Infinity))
            .addCommand(Controls.soft,     () => game.dropPiece(false))
            .addCommand(Controls.hard,     () => game.dropPiece(true))

            .addCommand(Controls.ccw,  () => game.tryRotate(-1))
            .addCommand(Controls.cw,   () => game.tryRotate( 1))
            .addCommand(Controls.flip, () => game.tryRotate( 2))

            .addCommand(Controls.hold, () => game.tryHold())
            .execute(gMsg);

        let cleaningUp = false;
        async function quit(reason?: string) {
            cleaningUp = true;
            runningGames[msg.channel.id] = undefined;

            game.lost = true;
            game.loseReason = reason || "Gave up";
            
            clearInterval(gameLoop);
            await emojiCommands.finish();
            await gMsg.edit(constructEmbed(game));
        }

        let gameLoop: NodeJS.Timeout;
        gameLoop = setInterval(async () => {
            if (game.lost) {
                if (cleaningUp) return; // Must've quit
                return await quit(game.loseReason);
            }

            for (let i = 0; i < 60; i++) {
                game.tickEngine();
                if (game.lost) {
                    return await quit(game.loseReason);
                }
            }

            await gMsg.edit(constructEmbed(game));
        }, 2000);

        runningGames[channel.id] = {
            host: msg.author.id,
            channel, game, quit
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
        await game.quit();
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
        await startNewGame(msg);
    });

    exchange.addCommand("admin_shutdown", async msg => {
        if (msg.author.id.toString() === "333530784495304705") {
            maintenance = true;

            Object.values(runningGames).forEach(game => {
                game.quit("Detris is restarting for maintenance. Please try making a new game in a minute.");
            });
        }
    });

    exchange.addCommand("admin_resume", async msg => {
        if (msg.author.id.toString() === "333530784495304705") {
            maintenance = false;
            msg.reply("Resumed Detris games without a restart, are you sure you didn't mean to restart my process?");
        }
    });
}
