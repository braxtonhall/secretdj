import {Client} from "discord.js";
import {User} from "../Types";
import {DatabaseController} from "../controller/DatabaseController";
import {createUserDataEmbed} from "./Util";
import {Log} from "@ubccpsc310/bot-base";

const syncDJFeed = async (client: Client, user: User): Promise<void> => {
    try {
        const db = DatabaseController.getInstance();
        const feed = await db.getDJFeed(user.guild);
        if (!feed) return;
        const guild = await client.guilds.fetch(user.guild);
        const channel = await guild.channels.fetch(feed);
        if (!channel?.isText()) return;

        if (user.feedId) {
            const feedMessage = await channel.messages.fetch(user.feedId);
            if (feedMessage) {
                await feedMessage.edit({
                    embeds: [createUserDataEmbed(user)]
                });
                return;
            }
        }

        const feedMessage = await channel.send({
            embeds: [createUserDataEmbed(user)]
        });
        user.feedId = feedMessage.id;
        await db.updateUser(user, true);
    } catch (error) {
        Log.error(error);
    }
};

export {syncDJFeed};
