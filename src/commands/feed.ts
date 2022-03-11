import {Command} from "@ubccpsc310/bot-base";
import {Client, Message} from "discord.js";
import {DatabaseController} from "../controller/DatabaseController";
import {ConfigKey, getConfig} from "../util/Config";

const feed: Command = {
    name: "feed",
    description: "Set the DJ feed",
    usage: "feed <password> <channel>",
    async procedure(client: Client, message: Message, args: string[]): Promise<Message> {
        const db = DatabaseController.getInstance();
        const {guild} = message;
        const [password] = args;

        if (!password) {
            return message.reply("A password must be supplied to set the DJ Feed");
        }
        if (password !== getConfig(ConfigKey.password)) {
            return message.reply("Password is not correct");
        }
        if (message.mentions.channels.size !== 1) {
            return message.reply("Should have exactly one feed channel set");
        }
        const channel = message.mentions.channels.first();
        if (!channel.isText()) {
            return message.reply("Channel should be a text channel");
        }
        await db.setDJFeed(guild.id, channel.id);
        await message.reply(`DJ Feed set to ${channel.toString()}`);
    },
};

export default feed;

