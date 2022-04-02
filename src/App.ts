import {ConfigKey, getConfig} from "./util/Config"; // Unfortunately must be the first import
import {startDiscord} from "@ubccpsc310/bot-base";
import {Intents} from "discord.js";
import {DatabaseController} from "./controller/DatabaseController";
import Server from "./server/Server";

DatabaseController.getInstance()
    .forceInit()
    .then(() => startDiscord({
        commandDirectory: `${__dirname}/commands`,
        listenerDirectory: `${__dirname}/listeners`,
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
        partials: ["CHANNEL"],
        token: getConfig(ConfigKey.botToken),
    }))
    .then((client) =>
        new Server(Number(process.env.PORT) || 8080, client).start());

